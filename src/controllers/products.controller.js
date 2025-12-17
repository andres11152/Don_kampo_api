import { getConnection } from "../database/connection.js"; // Importación correcta
import { uploadImage } from "../helpers/uploadImage.js";
import { queries, bulkQueries } from "../database/queries.interface.js";
import XLSX from "xlsx"; // Importar la librería para leer Excel

export const getProducts = async (req, res) => {
  let client;
  try {
    client = await getConnection();

    // 1. Obtener todos los productos (1 query)
    const productsResult = await client.query(queries.products.getProducts);

    if (productsResult.rows.length === 0) {
      return res.status(404).json({ message: "No hay productos disponibles" });
    }

    // Extraer IDs de productos para la siguiente query
    const productIds = productsResult.rows.map((p) => p.product_id);

    // 2. Obtener todas las variaciones y presentaciones en una sola query (¡Optimización clave!)
    const variationsResult = await client.query(
      queries.products.getProductVariations,
      [productIds] // Usa ANY($1) en la query
    );

    // 3. Agrupar variaciones por product_id en un objeto
    const variationsByProductId = variationsResult.rows.reduce(
      (acc, variation) => {
        if (!acc[variation.product_id]) acc[variation.product_id] = [];
        acc[variation.product_id].push({
          variation_id: variation.variation_id,
          quality: variation.quality,
          active: variation.active,
          presentations: variation.presentations,
        });
        return acc;
      },
      {}
    );

    // 4. Combinar productos con sus variaciones
    const productsWithVariations = productsResult.rows.map((product) => ({
      ...product,
      variations: variationsByProductId[product.product_id] || [],
    }));

    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

/**
 * Busca productos únicos por nombre (para autocomplete en modal de edición de órdenes)
 * Retorna productos sin duplicados, solo con información básica
 */
export const searchUniqueProducts = async (req, res) => {
  let client;
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: "Query debe tener al menos 2 caracteres" });
    }

    client = await getConnection();

    // Buscar productos únicos por nombre (case insensitive)
    const result = await client.query(
      `SELECT DISTINCT 
        p.product_id, 
        p.name, 
        p.photo_url
      FROM products p
      WHERE LOWER(p.name) LIKE LOWER($1)
      AND p.active = true
      ORDER BY p.name
      LIMIT 20`,
      [`%${q}%`]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({
      message: "Error al buscar productos",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

/**
 * Actualiza productos masivamente a partir de un array de datos (proveniente de un Excel/JSON).
 * Esta función está diseñada para alto rendimiento, manejando la lógica de creación,
 * actualización y eliminación de sub-entidades (variaciones, presentaciones) dentro de una transacción.
 */
export const bulkUpdateProducts = async (req, res) => {
  let client;
  const { products } = req.body;
  const startTime = Date.now();

  // 1. Validación inicial
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      message: "Se requiere un array de productos para la actualización.",
      success: false,
    });
  }

  try {
    client = await getConnection();
    await client.query("BEGIN");

    const results = {
      updated: 0,
      created: 0,
      deleted: 0,
      failed: [],
    };

    // 2. Iterar sobre cada producto del payload (del Excel)
    for (const productData of products) {
      const { product_id, variations, ...productFields } = productData;

      if (!product_id) {
        results.failed.push({
          productName: productData.name || "Sin ID",
          error: "Falta el product_id, no se puede actualizar.",
        });
        continue;
      }

      try {
        // 3. Actualizar el registro principal del producto
        const productUpdateResult = await client.query(
          queries.products.updateProduct,
          [
            productFields.name,
            productFields.description,
            productFields.category,
            productFields.photo_url, // Asume que la URL de la foto no cambia o viene en el Excel
            productFields.active,
            productFields.promocionar,
            product_id,
          ]
        );

        if (productUpdateResult.rowCount > 0) {
          results.updated++;
        }

        // 4. Obtener el estado actual de las variaciones y presentaciones desde la BD
        const { rows: existingVariations } = await client.query(
          queries.products.getProductVariations,
          [[product_id]]
        );

        const existingVariationIds = new Set(
          existingVariations.map((v) => v.variation_id)
        );
        const incomingVariationIds = new Set(
          variations.map((v) => v.variation_id).filter(Boolean)
        );

        // 5. Lógica de eliminación: Variaciones que están en la BD pero no en el Excel
        for (const ev of existingVariations) {
          if (!incomingVariationIds.has(ev.variation_id)) {
            await client.query(queries.products.deleteProductVariation, [
              ev.variation_id,
            ]);
            results.deleted++;
          }
        }

        // 6. Lógica de creación/actualización para variaciones y presentaciones
        for (const incomingVar of variations) {
          const {
            variation_id,
            quality,
            active: varActive,
            presentations,
          } = incomingVar;
          const variationStatus =
            typeof varActive !== "undefined" ? varActive : true;

          if (variation_id && existingVariationIds.has(variation_id)) {
            // 6a. ACTUALIZAR Variación existente
            await client.query(queries.products.updateProductVariation, [
              quality,
              variationStatus,
              variation_id,
            ]);

            // Lógica para presentaciones dentro de una variación existente
            const existingVariation = existingVariations.find(
              (ev) => ev.variation_id === variation_id
            );
            const existingPresIds = new Set(
              existingVariation.presentations.map((p) => p.presentation_id)
            );
            const incomingPresIds = new Set(
              presentations.map((p) => p.presentation_id).filter(Boolean)
            );

            // Eliminar presentaciones que ya no vienen
            for (const pres of existingVariation.presentations) {
              if (!incomingPresIds.has(pres.presentation_id)) {
                await client.query(queries.products.deletePresentation, [
                  pres.presentation_id,
                ]);
              }
            }

            for (const pres of presentations) {
              if (
                pres.presentation_id &&
                existingPresIds.has(pres.presentation_id)
              ) {
                // Actualizar presentación
                await client.query(queries.products.updateProductPresentation, [
                  pres.presentation,
                  parseInt(pres.stock, 10) || 0,
                  parseFloat(pres.price_home) || 0,
                  parseFloat(pres.price_supermarket) || 0,
                  parseFloat(pres.price_restaurant) || 0,
                  parseFloat(pres.price_fruver) || 0,
                  pres.presentation_id,
                ]);
              } else {
                // Crear nueva presentación
                await client.query(queries.products.createProductPresentation, [
                  variation_id,
                  pres.presentation,
                  parseInt(pres.stock, 10) || 0,
                  parseFloat(pres.price_home) || 0,
                  parseFloat(pres.price_supermarket) || 0,
                  parseFloat(pres.price_restaurant) || 0,
                  parseFloat(pres.price_fruver) || 0,
                ]);
              }
            }
          } else {
            // 6b. CREAR Nueva Variación (no tenía ID o el ID no estaba en la BD)
            const { rows } = await client.query(
              queries.products.createProductVariation,
              [
                product_id,
                quality,
                JSON.stringify(presentations),
                variationStatus,
              ]
            );
            const newVarId = rows[0].variation_id;
            results.created++;

            // Crear todas sus presentaciones
            for (const pres of presentations) {
              await client.query(queries.products.createProductPresentation, [
                newVarId,
                pres.presentation,
                parseInt(pres.stock, 10) || 0,
                parseFloat(pres.price_home) || 0,
                parseFloat(pres.price_supermarket) || 0,
                parseFloat(pres.price_restaurant) || 0,
                parseFloat(pres.price_fruver) || 0,
              ]);
            }
          }
        }
      } catch (innerError) {
        results.failed.push({
          productId: product_id,
          productName: productData.name,
          error: innerError.message,
        });
      }
    }

    // 7. Finalizar transacción
    await client.query("COMMIT");
    const processingTime = Date.now() - startTime;

    res.status(200).json({
      message: "Actualización masiva completada.",
      success: true,
      summary: {
        products_updated: results.updated,
        variations_created: results.created,
        variations_deleted: results.deleted,
        failures: results.failed.length,
        processingTime: `${processingTime}ms`,
      },
      failures: results.failed,
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Error en bulkUpdateProducts:", error);
    res.status(500).json({
      message: "Error crítico durante la actualización masiva.",
      success: false,
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await getConnection();
    const productResult = await client.query(queries.products.getProductById, [
      id,
    ]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const variationsResult = await client.query(
      queries.products.getProductVariations,
      [[id]]
    );

    const productWithVariations = {
      ...productResult.rows[0],
      variations: variationsResult.rows.map((variation) => ({
        ...variation,
        presentations: variation.presentations, // Array de IDs de presentaciones
      })),
    };
    res.status(200).json(productWithVariations);
  } catch (error) {
    console.error("Error al obtener el producto por ID:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el producto", error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const createProduct = async (req, res) => {
  let client;
  try {
    // Diagnostic logs to understand incoming multipart/form-data
    console.log("[createProduct] content-type:", req.headers["content-type"]);
    console.log("[createProduct] req.body keys:", Object.keys(req.body || {}));
    console.log("[createProduct] req.body sample:", req.body);
    console.log("[createProduct] req.file present:", !!req.file);
    console.log(
      "[createProduct] req.files present:",
      !!req.files,
      Array.isArray(req.files)
        ? req.files.length
        : Object.keys(req.files || {}).reduce(
            (acc, k) =>
              acc + (Array.isArray(req.files[k]) ? req.files[k].length : 1),
            0
          )
    );
    console.log(
      "[createProduct] req.optimizedImage present:",
      !!req.optimizedImage
    );

    // Try multiple ways to obtain form fields because multipart parsers sometimes
    // put fields as strings, arrays, or inside a single `data` field.
    let { name, description, category, variations, active, promocionar } =
      req.body || {};

    // If multer provided fields as arrays (e.g. name: ['...']), take first
    const pickFirst = (v) => (Array.isArray(v) ? v[0] : v);
    name = pickFirst(name);
    description = pickFirst(description);
    category = pickFirst(category);
    variations = pickFirst(variations);
    active = pickFirst(active);
    promocionar = pickFirst(promocionar);

    // If client sent a single JSON payload in a `data` field, try to parse it
    if ((!name || name === "") && req.body && req.body.data) {
      try {
        const parsed =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
        name = name || parsed.name;
        description = description || parsed.description;
        category = category || parsed.category;
        variations = variations || parsed.variations;
        active = typeof active !== "undefined" ? active : parsed.active;
        promocionar =
          typeof promocionar !== "undefined" ? promocionar : parsed.promocionar;
        console.log("[createProduct] extracted from data field");
      } catch (err) {
        console.warn(
          "[createProduct] could not parse req.body.data",
          err.message
        );
      }
    }

    // as last resort, log and return clear validation error instead of DB 500
    if (!name || (typeof name === "string" && name.trim() === "")) {
      console.warn("[createProduct] Missing required field: name");
      return res
        .status(400)
        .json({
          message: "El campo `name` es requerido en el formulario",
          receivedBody: req.body,
        });
    }

    // Si no se envía el estado, lo dejamos activo por defecto
    const productActive = typeof active !== "undefined" ? active : true;
    // Definir un valor por defecto para promocionar (por ejemplo, false)
    const productPromocionar =
      typeof promocionar === "boolean" ? promocionar : false;

    const defaultPhotoUrl = "https://example.com/default-image.jpg";
    let photoUrl = defaultPhotoUrl;
    // Preferir imagen optimizada si existe (middleware `optimizeImage` coloca buffer en req.optimizedImage)
    const imageBuffer =
      req.optimizedImage || (req.file && req.file.buffer) || null;
    const originalName = (req.file && req.file.originalname) || "upload.jpg";
    if (imageBuffer) {
      try {
        photoUrl = await uploadImage(imageBuffer, originalName);
      } catch (error) {
        // No detener la creación del producto por un fallo en S3 en entorno de desarrollo.
        console.error(
          "Error al subir la imagen a S3, se continuará con imagen por defecto:",
          error.message
        );
        // photoUrl queda con defaultPhotoUrl
      }
    }
    client = await getConnection();

    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      photoUrl,
      productActive,
      productPromocionar,
    ]);
    const productId = result.rows[0].product_id;

    let parsedVariations = [];
    if (typeof variations === "string") {
      try {
        parsedVariations = JSON.parse(variations);
      } catch (err) {
        console.warn(
          "createProduct: could not parse variations, defaulting to []",
          err.message
        );
        parsedVariations = [];
      }
    } else if (Array.isArray(variations)) {
      parsedVariations = variations;
    }

    if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
      for (const variation of parsedVariations) {
        const { quality, presentations, active: variationActive } = variation;
        if (
          !quality ||
          !Array.isArray(presentations) ||
          presentations.length === 0
        )
          continue;

        const variationStatus =
          typeof variationActive !== "undefined" ? variationActive : true;

        // Asegurar que cada presentación tiene los precios correctos
        const formattedPresentations = presentations.map((presentation) => ({
          ...presentation,
          price_home: parseFloat(presentation.price_home || 0),
          price_supermarket: parseFloat(presentation.price_supermarket || 0),
          price_restaurant: parseFloat(presentation.price_restaurant || 0),
          price_fruver: parseFloat(presentation.price_fruver || 0),
        }));

        // Crear la variación del producto
        const variationResult = await client.query(
          queries.products.createProductVariation,
          [
            productId,
            quality,
            JSON.stringify(formattedPresentations),
            variationStatus,
          ]
        );
        const variationId = variationResult.rows[0].variation_id;

        // Insertar las presentaciones asociadas con esta variación
        for (const presentation of formattedPresentations) {
          await client.query(queries.products.createProductPresentation, [
            variationId,
            presentation.presentation,
            presentation.price_home,
            presentation.price_supermarket,
            presentation.price_restaurant,
            presentation.price_fruver,
            presentation.stock,
          ]);
        }
      }
    }

    res.status(201).json({
      message: "Producto creado exitosamente",
      product_id: productId,
    });
  } catch (error) {
    console.error("Error en createProduct:", error.message);
    res
      .status(500)
      .json({ message: "Error al crear el producto", error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const updateProducts = async (req, res) => {
  let client;

  // 1) Determinar si es bulk o single
  const isBulk = Array.isArray(req.body);
  let productsList = [];

  if (isBulk) {
    productsList = req.body;
  } else {
    // single: extraer id de params y los campos de body
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: "ID de producto inválido" });
    }
    // parsear variaciones como en tu código
    let parsedVariations;
    try {
      parsedVariations =
        typeof req.body.variations === "string"
          ? JSON.parse(req.body.variations)
          : req.body.variations;
    } catch {
      return res
        .status(400)
        .json({ message: "Error al parsear las variaciones" });
    }

    // Detect uploaded file(s) when using multer.fields or upload.any()
    const uploadedFile =
      req.file ||
      (Array.isArray(req.files) && req.files.length ? req.files[0] : null) ||
      (req.files && req.files.photo_url && req.files.photo_url[0]
        ? req.files.photo_url[0]
        : null) ||
      (req.files && req.files.photo && req.files.photo[0]
        ? req.files.photo[0]
        : null);

    productsList = [
      {
        product_id: parsedId,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        photo_url: req.body.photo_url,
        variations: parsedVariations || [],
        active: typeof req.body.active !== "undefined" ? req.body.active : true,
        promocionar:
          typeof req.body.promocionar !== "undefined"
            ? req.body.promocionar
            : false,
        // en single viene req.file o req.files, en bulk no
        file: uploadedFile,
      },
    ];
  }

  try {
    client = await getConnection();
    await client.query("BEGIN");

    // 2) Procesar cada producto
    for (const prod of productsList) {
      const {
        product_id,
        name,
        description,
        category,
        photo_url,
        variations,
        active,
        promocionar,
        file,
      } = prod;

      // 3) Subir imagen si viene (soportar req.optimizedImage o file de multer)
      let updatedPhotoUrl = photo_url || null;
      try {
        if (file && file.buffer) {
          updatedPhotoUrl = await uploadImage(file.buffer, file.originalname);
        } else if (req.optimizedImage) {
          // Si optimizeImage produjo un buffer (multer.fields case), usarlo
          const origName =
            (file && file.originalname) || `${product_id || "upload"}.jpg`;
          updatedPhotoUrl = await uploadImage(req.optimizedImage, origName);
        }
      } catch (err) {
        throw new Error(`Error subiendo imagen: ${err.message}`);
      }

      // 4) Actualizar el registro principal
      const upd = await client.query(queries.products.updateProduct, [
        name,
        description,
        category,
        updatedPhotoUrl,
        active,
        promocionar,
        product_id,
      ]);
      if (upd.rowCount === 0) {
        throw new Error(`Producto ${product_id} no encontrado`);
      }

      // 5) Traer las variaciones actuales para comparar
      const { rows: existingVariations } = await client.query(
        queries.products.getProductVariations,
        [[product_id]]
      );

      // 6) Eliminar variaciones y presentaciones que ya no existen
      await Promise.all(
        existingVariations.map(async (ev) => {
          const newVarIndex = variations.findIndex(
            (v) => v.variation_id === ev.variation_id
          );

          if (newVarIndex === -1) {
            // toda la variación fue borrada
            await client.query(queries.products.deleteProductVariation, [
              ev.variation_id,
            ]);
          } else {
            // solo borrar presentaciones sueltas
            await Promise.all(
              ev.presentations.map(async (pres) => {
                const keep = variations[newVarIndex].presentations.some(
                  (p) => p.presentation_id === pres.presentation_id
                );
                if (!keep) {
                  await client.query(queries.products.deletePresentation, [
                    pres.presentation_id,
                  ]);
                }
              })
            );
          }
        })
      );

      // 7) Crear o actualizar cada variación y sus presentaciones
      for (const v of variations) {
        const { variation_id, quality, presentations, active: varActive } = v;
        if (
          !quality ||
          !Array.isArray(presentations) ||
          presentations.length === 0
        ) {
          continue;
        }
        const status = typeof varActive !== "undefined" ? varActive : true;

        if (!variation_id) {
          // 7a) crear nueva variación
          const { rows } = await client.query(
            queries.products.createProductVariation,
            [product_id, quality, JSON.stringify(presentations), status]
          );
          const newVarId = rows[0].variation_id;

          // insertar todas sus presentaciones
          for (const p of presentations) {
            await client.query(queries.products.createProductPresentation, [
              newVarId,
              p.presentation,
              parseInt(p.stock, 10),
              p.price_home,
              p.price_supermarket,
              p.price_restaurant,
              p.price_fruver,
            ]);
          }
        } else {
          // 7b) actualizar variación existente
          await client.query(queries.products.updateProductVariation, [
            quality,
            status,
            variation_id,
          ]);

          // insertar o actualizar presentaciones
          for (const p of presentations) {
            // comprobar si ya existe
            const { rows: exists } = await client.query(
              queries.products.getPresentationByVariationAndId,
              [variation_id, p.presentation_id]
            );

            if (exists.length) {
              // actualizar
              await client.query(queries.products.updateProductPresentation, [
                variation_id,
                p.presentation,
                parseInt(p.stock, 10) || 0,
                Math.round(Number(p.price_home) || 0),
                Math.round(Number(p.price_supermarket) || 0),
                Math.round(Number(p.price_restaurant) || 0),
                Math.round(Number(p.price_fruver) || 0),
                p.presentation_id,
              ]);
            } else {
              // crear
              await client.query(queries.products.createProductPresentation, [
                variation_id,
                p.presentation,
                Math.round(Number(p.price_home) || 0),
                Math.round(Number(p.price_supermarket) || 0),
                Math.round(Number(p.price_restaurant) || 0),
                Math.round(Number(p.price_fruver) || 0),
                parseInt(p.stock, 10) || 0,
              ]);
            }
          }
        }
      }
    }

    // 8) Commit o rollback
    await client.query("COMMIT");
    return res.status(200).json({
      message: isBulk
        ? "Productos actualizados exitosamente."
        : "Producto actualizado exitosamente.",
    });
  } catch (error) {
    console.error("Error en updateProducts:", error);
    if (client) await client.query("ROLLBACK");
    return res.status(500).json({
      message: isBulk
        ? "Error al actualizar productos."
        : "Error al actualizar producto.",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  let client;
  if (!id) {
    return res.status(400).json({ message: "El ID del producto es requerido" });
  }

  try {
    client = await getConnection();
    const result = await client.query(queries.products.deleteProduct, [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado o ya eliminado" });
    }
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el producto", error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Crea productos masivamente desde datos de Excel
 * Optimizado para alto rendimiento con transacciones y batch inserts
 */
export const createProductsBulk = async (req, res) => {
  let client;
  const startTime = Date.now();

  try {
    const { products, validateOnly = false } = req.body;
    // DEBUG: log basic info to help diagnosticar 500s
    console.log(
      "[BulkUpload] validateOnly:",
      validateOnly,
      "products present:",
      Array.isArray(products),
      "products length:",
      Array.isArray(products) ? products.length : 0
    );
    if (!products && req.file) {
      // Si vino un archivo pero no hay parsing en el cliente, devolver error claro
      console.warn(
        "[BulkUpload] Se recibió archivo en multipart pero no hay `products` en el body. Parsing de Excel no implementado en servidor."
      );
      return res.status(400).json({
        message:
          "Se recibió archivo pero el servidor espera un JSON con `products`. Por favor sube el Excel desde el cliente que lo convierte a JSON.",
        success: false,
      });
    }

    // Validación inicial
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Se requiere un array de productos válido",
        success: false,
      });
    }

    // Límite de seguridad para evitar sobrecarga
    if (products.length > 1000) {
      return res.status(400).json({
        message: "Máximo 1000 productos por lote para mantener el rendimiento",
        success: false,
      });
    }

    client = await getConnection();

    // 1. VALIDACIÓN MASIVA - Verificar datos antes de procesar
    // Preparar lista de nombres entrantes y consultar solo los existentes para validar duplicados
    const inputNames = products
      .map((p) => (p.name || "").toLowerCase())
      .filter(Boolean);
    let existingProductNames = new Set();
    if (inputNames.length) {
      try {
        const existingProductsResult = await client.query(
          bulkQueries.checkExistingProductsByName,
          [inputNames]
        );
        existingProductNames = new Set(
          existingProductsResult.rows.map((row) => row.name.toLowerCase())
        );
      } catch (dbErr) {
        console.error(
          "[BulkUpload] Error ejecutando checkExistingProductsByName:",
          dbErr
        );
        return res.status(500).json({
          message: "Error consultando productos existentes",
          error: dbErr.message,
          success: false,
        });
      }
    }
    const validationResult = await validateBulkProducts(
      client,
      products,
      existingProductNames
    );

    if (!validationResult.isValid) {
      return res.status(400).json({
        message: "Errores de validación encontrados",
        success: false,
        errors: validationResult.errors,
        validProducts: validationResult.validCount,
        totalProducts: products.length,
      });
    }

    // Si solo es validación, retornar resultado
    if (validateOnly) {
      return res.status(200).json({
        message: "Validación completada exitosamente",
        success: true,
        validProducts: validationResult.validCount,
        totalProducts: products.length,
        validationTime: Date.now() - startTime,
      });
    }

    // 2. INICIAR TRANSACCIÓN PARA CREACIÓN MASIVA
    await client.query("BEGIN");

    const results = {
      created: [],
      failed: [],
      totalProcessed: 0,
      startTime: new Date().toISOString(),
    };

    // 3. PROCESAR EN LOTES PARA OPTIMIZAR MEMORIA
    const BATCH_SIZE = 50; // Procesar de 50 en 50 para balance memoria/velocidad

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchResult = await processBatch(client, batch, i);

      results.created.push(...batchResult.created);
      results.failed.push(...batchResult.failed);
      results.totalProcessed += batch.length;

      // Log de progreso para lotes grandes
      if (products.length > 100) {
        console.log(
          `Procesado lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            products.length / BATCH_SIZE
          )} - ${results.totalProcessed}/${products.length} productos`
        );
      }
    }

    // 4. COMMIT DE TODA LA TRANSACCIÓN
    await client.query("COMMIT");
    // 5. RESPUESTA DETALLADA
    const processingTime = Date.now() - startTime;
    return res.status(201).json({
      message: "Procesamiento masivo completado",
      success: true,
      summary: {
        totalProducts: products.length,
        created: results.created.length,
        failed: results.failed.length,
        processingTime: `${processingTime}ms`,
        averageTimePerProduct: `${(processingTime / products.length).toFixed(
          2
        )}ms`,
      },
      results: {
        created: results.created,
        failed: results.failed,
      },
      performance: {
        batchSize: BATCH_SIZE,
        totalBatches: Math.ceil(products.length / BATCH_SIZE),
        startTime: results.startTime,
        endTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    // ROLLBACK en caso de error
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error en rollback:", rollbackError);
      }
    }

    console.error("Error en createProductsBulk:", error);
    return res.status(500).json({
      message: "Error en la creación masiva de productos",
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
    });
  } finally {
    if (client) client.release();
  }
};

/**
 * Valida masivamente los productos antes de crear
 */
async function validateBulkProducts(
  client,
  products,
  existingProductNames = new Set()
) {
  const errors = [];
  let validCount = 0;

  // Obtener todas las categorías existentes de una vez desde queries.interface
  const categoriesResult = await client.query(bulkQueries.getAllCategories);
  const existingCategories = new Set(
    categoriesResult.rows.map((row) => row.category.toLowerCase())
  );

  // Validar cada producto
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productErrors = [];

    // Validaciones básicas
    if (
      !product.name ||
      typeof product.name !== "string" ||
      product.name.trim().length < 2
    ) {
      productErrors.push("Nombre requerido (mínimo 2 caracteres)");
    } else if (existingProductNames.has(product.name.toLowerCase())) {
      productErrors.push("Producto con este nombre ya existe");
    }

    if (
      !product.description ||
      typeof product.description !== "string" ||
      product.description.trim().length < 10
    ) {
      productErrors.push("Descripción requerida (mínimo 10 caracteres)");
    }

    if (!product.category || typeof product.category !== "string") {
      productErrors.push("Categoría requerida");
    }

    // Validar variaciones
    if (
      !product.variations ||
      !Array.isArray(product.variations) ||
      product.variations.length === 0
    ) {
      productErrors.push("Al menos una variación es requerida");
    } else {
      product.variations.forEach((variation, vIndex) => {
        if (!variation.quality || typeof variation.quality !== "string") {
          productErrors.push(`Variación ${vIndex + 1}: Calidad requerida`);
        }

        if (
          !variation.presentations ||
          !Array.isArray(variation.presentations) ||
          variation.presentations.length === 0
        ) {
          productErrors.push(
            `Variación ${vIndex + 1}: Al menos una presentación requerida`
          );
        } else {
          variation.presentations.forEach((presentation, pIndex) => {
            if (
              !presentation.presentation ||
              typeof presentation.presentation !== "string"
            ) {
              productErrors.push(
                `Variación ${vIndex + 1}, Presentación ${
                  pIndex + 1
                }: Nombre de presentación requerido`
              );
            }

            // Validar precios (deben ser números >= 0)
            const priceFields = [
              "price_home",
              "price_supermarket",
              "price_restaurant",
              "price_fruver",
            ];
            priceFields.forEach((field) => {
              const price = parseFloat(presentation[field]);
              if (isNaN(price) || price < 0) {
                productErrors.push(
                  `Variación ${vIndex + 1}, Presentación ${
                    pIndex + 1
                  }: ${field} debe ser un número >= 0`
                );
              }
            });

            // Validar stock
            const stock = parseInt(presentation.stock);
            if (isNaN(stock) || stock < 0) {
              productErrors.push(
                `Variación ${vIndex + 1}, Presentación ${
                  pIndex + 1
                }: Stock debe ser un número >= 0`
              );
            }
          });
        }
      });
    }

    if (productErrors.length > 0) {
      errors.push({
        productIndex: i + 1,
        productName: product.name || "Sin nombre",
        errors: productErrors,
      });
    } else {
      validCount++;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validCount,
    totalCount: products.length,
  };
}

/**
 * Procesa un lote de productos
 */
async function processBatch(client, batch, startIndex) {
  const created = [];
  const failed = [];

  for (let i = 0; i < batch.length; i++) {
    try {
      const product = batch[i];
      const globalIndex = startIndex + i + 1;

      // Valores por defecto
      const productActive =
        typeof product.active !== "undefined" ? product.active : true;
      const productPromocionar =
        typeof product.promocionar === "boolean" ? product.promocionar : false;
      const defaultPhotoUrl = "https://example.com/default-image.jpg";

      // Crear producto principal
      const productResult = await client.query(queries.products.createProduct, [
        product.name.trim(),
        product.description.trim(),
        product.category.trim(),
        product.photo_url || defaultPhotoUrl,
        productActive,
        productPromocionar,
      ]);

      const productId = productResult.rows[0].product_id;

      // Crear variaciones y presentaciones
      for (const variation of product.variations) {
        const variationStatus =
          typeof variation.active !== "undefined" ? variation.active : true;

        // Formatear presentaciones
        const formattedPresentations = variation.presentations.map(
          (presentation) => ({
            presentation: presentation.presentation.trim(),
            price_home: parseFloat(presentation.price_home || 0),
            price_supermarket: parseFloat(presentation.price_supermarket || 0),
            price_restaurant: parseFloat(presentation.price_restaurant || 0),
            price_fruver: parseFloat(presentation.price_fruver || 0),
            stock: parseInt(presentation.stock || 0),
          })
        );

        // Crear variación
        const variationResult = await client.query(
          queries.products.createProductVariation,
          [
            productId,
            variation.quality.trim(),
            JSON.stringify(formattedPresentations),
            variationStatus,
          ]
        );

        const variationId = variationResult.rows[0].variation_id;

        // Crear presentaciones
        for (const presentation of formattedPresentations) {
          await client.query(queries.products.createProductPresentation, [
            variationId,
            presentation.presentation,
            presentation.price_home,
            presentation.price_supermarket,
            presentation.price_restaurant,
            presentation.price_fruver,
            presentation.stock,
          ]);
        }
      }

      created.push({
        index: globalIndex,
        productId: productId,
        name: product.name,
        variationsCount: product.variations.length,
        presentationsCount: product.variations.reduce(
          (total, v) => total + v.presentations.length,
          0
        ),
      });
    } catch (error) {
      failed.push({
        index: startIndex + i + 1,
        name: batch[i].name || "Sin nombre",
        error: error.message,
      });
    }
  }

  return { created, failed };
}

/**
 * Endpoint para validar productos sin crearlos
 */
export const validateProductsBulk = async (req, res) => {
  try {
    // Extraer productos del body si vienen como JSON
    const products = req.body?.products;
    if (!Array.isArray(products) || products.length === 0) {
      // Si viene como archivo y no como JSON, informar claramente
      if (req.file) {
        console.warn(
          "[BulkValidate] Se recibió archivo en multipart pero el cliente debe enviar JSON `products`."
        );
        return res.status(400).json({
          message:
            "Por favor envía un JSON con `products` (el cliente normalmente transforma el Excel a JSON antes de enviarlo).",
          success: false,
        });
      }
      return res.status(400).json({
        message: "Se requiere un array `products` en el body para validar.",
        success: false,
      });
    }

    // Ejecutar validación usando una conexión directa para obtener detalles
    const client = await getConnection();
    try {
      const inputNames = products
        .map((p) => (p.name || "").toLowerCase())
        .filter(Boolean);
      let existingProductNames = new Set();
      if (inputNames.length) {
        const existingProductsResult = await client.query(
          bulkQueries.checkExistingProductsByName,
          [inputNames]
        );
        existingProductNames = new Set(
          existingProductsResult.rows.map((row) => row.name.toLowerCase())
        );
      }
      const validationResult = await validateBulkProducts(
        client,
        products,
        existingProductNames
      );
      if (!validationResult.isValid) {
        return res.status(400).json({
          message: "Errores de validación encontrados",
          success: false,
          errors: validationResult.errors,
          validProducts: validationResult.validCount,
          totalProducts: products.length,
        });
      }
      return res.status(200).json({
        message: "Validación completada exitosamente",
        success: true,
        validProducts: validationResult.validCount,
        totalProducts: products.length,
      });
    } finally {
      if (client) client.release();
    }
  } catch (error) {
    console.error("Error en validateProductsBulk:", error);
    return res.status(500).json({
      message: "Error en la validación de productos",
      success: false,
      error: error.message,
    });
  }
};

export const updatePricesByPresentation = async (req, res) => {
  let client;
  // eslint-disable-next-line no-unused-vars
  const updatesList = req.body; // Recibe el array [{ presentation_id, target_column, new_price }, ...]

  // 1. Validaciones básicas
  if (!Array.isArray(updatesList) || updatesList.length === 0) {
    return res
      .status(400)
      .json({ message: "Se requiere un array de actualizaciones válido." });
  }

  // Lista blanca de columnas permitidas para evitar SQL Injection
  const ALLOWED_COLUMNS = [
    "price_home",
    "price_restaurant",
    "price_supermarket",
    "price_fruver",
    "stock", // Agregado por si en el futuro quieres actualizar stock también
  ];

  try {
    client = await getConnection();
    await client.query("BEGIN");

    console.log(
      `[PriceUpdate] Procesando ${updatesList.length} actualizaciones de precios...`
    );
    console.time("PRICE_UPDATE");

    let updatedCount = 0;

    for (const item of updatesList) {
      const { presentation_id, target_column, new_price } = item;

      // 2. Validar que tengamos los datos mínimos
      if (
        !presentation_id ||
        !target_column ||
        new_price === undefined ||
        new_price === null
      ) {
        continue; // Saltamos filas incompletas o con precio nulo
      }

      // 3. SEGURIDAD: Validar que la columna objetivo sea válida
      if (!ALLOWED_COLUMNS.includes(target_column)) {
        console.warn(
          `Intento de actualización en columna no permitida: ${target_column}`
        );
        continue;
      }

      // 4. Validar y parsear el nuevo precio
      const numericPrice = parseFloat(new_price);
      if (isNaN(numericPrice)) {
        console.warn(
          `Valor de precio inválido para presentation_id ${presentation_id}: ${new_price}`
        );
        continue; // Saltar si el precio no es un número válido
      }

      // 5. Ejecutar la actualización directa
      const result = await client.query(
        `UPDATE product_presentations 
                 SET ${target_column} = $1 
                 WHERE presentation_id = $2`,
        [Math.round(numericPrice), presentation_id] // CORRECCIÓN: Redondear a entero
      );

      // rowCount nos dice si realmente encontró el ID y actualizó
      if (result.rowCount > 0) {
        updatedCount++;
      }
    }

    console.timeEnd("PRICE_UPDATE");
    await client.query("COMMIT");

    console.log(
      `[PriceUpdate] Éxito. Se actualizaron ${updatedCount} registros.`
    );

    res.status(200).json({
      message: "Actualización de precios completada.",
      total_processed: updatesList.length,
      total_updated: updatedCount,
    });
  } catch (error) {
    console.error("Error en updatePricesByPresentation:", error);
    if (client) {
      await client.query("ROLLBACK");
    }
    return res.status(500).json({
      message: "Error crítico al actualizar precios.",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

export const bulkUpdateFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo." });
  }

  let client; // Declarar el cliente fuera del try

  try {
    client = await getConnection(); // Obtener conexión del pool de forma segura
    // Inicia una transacción para asegurar la integridad de los datos.
    await client.query("BEGIN");

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" }); // Leer el archivo Excel

    // --- PROCESAMIENTO DE DATOS ---
    const productsSheet = XLSX.utils.sheet_to_json(
      workbook.Sheets["Productos"]
    );
    const variationsSheet = XLSX.utils.sheet_to_json(
      workbook.Sheets["Variaciones"]
    );
    const presentationsSheet = XLSX.utils.sheet_to_json(
      workbook.Sheets["Presentaciones"]
    );

    // --- CONTADORES PARA EL RESULTADO ---
    let productsUpdated = 0;
    let variationsUpdated = 0;
    let presentationsUpdated = 0;

    // 1. ACTUALIZAR PRODUCTOS
    if (productsSheet && productsSheet.length > 0) {
      for (const product of productsSheet) {
        const { Id, Nombre, Descripcion, Categoria, Promocionar, Activo } =
          product;
        if (!Id) continue;
        await client.query(
          `UPDATE products SET name = $1, description = $2, category = $3, promocionar = $4, active = $5, updated_at = CURRENT_TIMESTAMP WHERE product_id = $6`,
          [Nombre, Descripcion, Categoria, Promocionar, Activo, Id]
        );
        productsUpdated++;
      }
    }

    // 2. ACTUALIZAR VARIACIONES
    if (variationsSheet && variationsSheet.length > 0) {
      for (const variation of variationsSheet) {
        const { "Id Variacion": variationId, Calidad, Activo } = variation;
        if (!variationId) continue;
        await client.query(
          `UPDATE product_variations SET quality = $1, active = $2 WHERE variation_id = $3`,
          [Calidad, Activo, variationId]
        );
        variationsUpdated++;
      }
    }

    // 3. ACTUALIZAR PRESENTACIONES Y PRECIOS
    if (presentationsSheet && presentationsSheet.length > 0) {
      for (const presentation of presentationsSheet) {
        const {
          "Id Presentacion": presentationId,
          Presentacion,
          "Precio Hogar": price_home,
          "Precio Supermercado": price_supermarket,
          "Precio Restaurante": price_restaurant,
          "Precio Fruver": price_fruver,
        } = presentation;
        if (!presentationId) continue;
        await client.query(
          `UPDATE product_presentations SET presentation = $1, price_home = $2, price_supermarket = $3, price_restaurant = $4, price_fruver = $5 WHERE presentation_id = $6`,
          [
            Presentacion,
            price_home || 0,
            price_supermarket || 0,
            price_restaurant || 0,
            price_fruver || 0,
            presentationId,
          ]
        );
        presentationsUpdated++;
      }
    }

    // Si todo ha ido bien, confirma la transacción.
    await client.query("COMMIT");

    res.status(200).json({
      message: "Actualización masiva completada con éxito.",
      productsUpdated,
      variationsUpdated,
      presentationsUpdated,
    });
  } catch (error) {
    // Si algo falla, revierte todos los cambios.
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error en la actualización masiva:", error);
    res.status(500).json({
      message: "Error en el servidor al procesar el archivo.",
      error: error.message,
    });
  } finally {
    // Libera la conexión a la base de datos.
    if (client) {
      client.release();
    }
  }
};
