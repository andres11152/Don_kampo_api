import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js';
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const productsResult = await client.query(queries.products.getProducts);

    if (productsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No hay productos disponibles' });
    }

    const productsWithVariations = [];

    // Iterar sobre los productos para agregar las variaciones
    for (const row of productsResult.rows) {
      const existingProduct = productsWithVariations.find(
        (product) => product.product_id === row.product_id
      );
      // Traer las variaciones de cada producto
      const variationsResult = await client.query(queries.products.getProductVariations, [row.product_id]);

      // Filtrar y agrupar las variaciones para evitar duplicaciones
      const variationData = variationsResult.rows.map((variation) => ({
        variation_id: variation.variation_id,
        quality: variation.quality,
        active: variation.active,
        presentations: variation.presentations,  // Las presentaciones ya estarán completas
      }));

      // Si el producto ya existe, agregamos las variaciones sin duplicar
      if (existingProduct) {
        variationData.forEach(variation => {
          // Si la variación no está ya agregada, la agregamos
          const existingVariation = existingProduct.variations.find(v => v.variation_id === variation.variation_id);
          if (!existingVariation) {
            existingProduct.variations.push(variation);
          }
        });
      } else {
        // Si el producto no existe, lo agregamos con las variaciones
        productsWithVariations.push({
          product_id: row.product_id,
          name: row.name,
          description: row.description,
          category: row.category,
          photo_url: row.photo_url,
          active: row.active,
          promocionar: row.promocionar,
          variations: variationData,
        });
      }
    }

    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await getConnection();
    const productResult = await client.query(queries.products.getProductById, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const variationsResult = await client.query(queries.products.getProductVariations, [id]);

    const productWithVariations = {
      ...productResult.rows[0],
      variations: variationsResult.rows.map((variation) => ({
        ...variation,
        presentations: variation.presentations,  // Array de IDs de presentaciones
      }))
    };
    res.status(200).json(productWithVariations);

  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const createProduct = async (req, res) => {
  let client;
  try {
    const { name, description, category, variations, active, promocionar } = req.body;

    // Si no se envía el estado, lo dejamos activo por defecto
    const productActive = typeof active !== 'undefined' ? active : true;
    // Definir un valor por defecto para promocionar (por ejemplo, false)
    const productPromocionar = (typeof promocionar === 'boolean') ? promocionar : false;

    const defaultPhotoUrl = 'https://example.com/default-image.jpg';
    let photoUrl = defaultPhotoUrl;
    if (req.file && req.file.buffer) {
      try {
        photoUrl = await uploadImage(req.file.buffer, req.file.originalname);
      } catch (error) {
        console.error('Error al subir la imagen:', error.message);
        return res.status(500).json({ message: 'Error al subir la imagen a S3' });
      }
    }
    client = await getConnection();

    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      photoUrl,
      productActive,
      productPromocionar
    ]);
    const productId = result.rows[0].product_id;

    const parsedVariations = JSON.parse(variations);

    if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
      for (const variation of parsedVariations) {
        const { quality, presentations, active: variationActive } = variation;
        if (!quality || !Array.isArray(presentations) || presentations.length === 0) continue;

        const variationStatus = typeof variationActive !== 'undefined' ? variationActive : true;

        // Asegurar que cada presentación tiene los precios correctos
        const formattedPresentations = presentations.map(presentation => ({
          ...presentation,
          price_home: parseFloat(presentation.price_home || 0),
          price_supermarket: parseFloat(presentation.price_supermarket || 0),
          price_restaurant: parseFloat(presentation.price_restaurant || 0),
          price_fruver: parseFloat(presentation.price_fruver || 0)
        }));

        // Crear la variación del producto
        const variationResult = await client.query(queries.products.createProductVariation, [
          productId,
          quality,
          JSON.stringify(formattedPresentations),
          variationStatus
        ]);
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
            presentation.stock
          ]);
        }
      }
    }

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: productId
    });
  } catch (error) {
    console.error('Error en createProduct:', error.message);
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
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
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    // parsear variaciones como en tu código
    let parsedVariations;
    try {
      parsedVariations = typeof req.body.variations === 'string'
        ? JSON.parse(req.body.variations)
        : req.body.variations;
    } catch {
      return res.status(400).json({ message: 'Error al parsear las variaciones' });
    }

    productsList = [{
      product_id: parsedId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      photo_url: req.body.photo_url,
      variations: parsedVariations || [],
      active: typeof req.body.active !== 'undefined' ? req.body.active : true,
      promocionar: typeof req.body.promocionar !== 'undefined' ? req.body.promocionar : false,
      // en single viene req.file, en bulk no
      file: req.file || null,
    }];
  }

  try {
    client = await getConnection();
    await client.query('BEGIN');

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
        file
      } = prod;

      // 3) Subir imagen si viene
      let updatedPhotoUrl = photo_url || null;
      if (file && file.buffer) {
        try {
          updatedPhotoUrl = await uploadImage(file.buffer, file.originalname);
        } catch (err) {
          throw new Error(`Error subiendo imagen: ${err.message}`);
        }
      }

      // 4) Actualizar el registro principal
      const upd = await client.query(queries.products.updateProduct, [
        name, description, category, updatedPhotoUrl,
        active, promocionar, product_id
      ]);
      if (upd.rowCount === 0) {
        throw new Error(`Producto ${product_id} no encontrado`);
      }

      // 5) Traer las variaciones actuales para comparar
      const { rows: existingVariations } =
        await client.query(queries.products.getProductVariations, [product_id]);

      // 6) Eliminar variaciones y presentaciones que ya no existen
      await Promise.all(existingVariations.map(async ev => {
        const newVarIndex = variations.findIndex(v => v.variation_id === ev.variation_id);

        if (newVarIndex === -1) {
          // toda la variación fue borrada
          await client.query(queries.products.deleteProductVariation, [ev.variation_id]);
        } else {
          // solo borrar presentaciones sueltas
          await Promise.all(ev.presentations.map(async pres => {
            const keep = variations[newVarIndex].presentations
                           .some(p => p.presentation_id === pres.presentation_id);
            if (!keep) {
              await client.query(queries.products.deletePresentation, [pres.presentation_id]);
            }
          }));
        }
      }));

      // 7) Crear o actualizar cada variación y sus presentaciones
      for (const v of variations) {
        const {
          variation_id,
          quality,
          presentations,
          active: varActive
        } = v;
        if (!quality || !Array.isArray(presentations) || presentations.length === 0) {
          continue;
        }
        const status = typeof varActive !== 'undefined' ? varActive : true;

        if (!variation_id) {
          // 7a) crear nueva variación
          const { rows } = await client.query(queries.products.createProductVariation, [
            product_id, quality, JSON.stringify(presentations), status
          ]);
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
            quality, status, variation_id
          ]);

          // insertar o actualizar presentaciones
          for (const p of presentations) {
            // comprobar si ya existe
            const { rows: exists } = await client.query(
              `SELECT presentation_id FROM product_presentations
               WHERE variation_id = $1 AND presentation_id = $2`,
              [variation_id, p.presentation_id]
            );

            if (exists.length) {
              // actualizar
              await client.query(queries.products.updateProductPresentation, [
                variation_id,
                p.presentation,
                parseInt(p.stock, 10) || 0,
                p.price_home,
                p.price_supermarket,
                p.price_restaurant,
                p.price_fruver,
                p.presentation_id
              ]);
            } else {
              // crear
              await client.query(queries.products.createProductPresentation, [
                variation_id,
                p.presentation,
                p.price_home,
                p.price_supermarket,
                p.price_restaurant,
                p.price_fruver,
                parseInt(p.stock, 10) || 0
              ]);
            }
          }
        }
      }
    }

    // 8) Commit o rollback
    await client.query('COMMIT');
    return res.status(200).json({
      message: isBulk
        ? 'Productos actualizados exitosamente.'
        : 'Producto actualizado exitosamente.'
    });

  } catch (error) {
    console.error('Error en updateProducts:', error);
    if (client) await client.query('ROLLBACK');
    return res.status(500).json({
      message: isBulk
        ? 'Error al actualizar productos.'
        : 'Error al actualizar producto.',
      error: error.message
    });
  } finally {
    if (client) client.release();
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  let client;
  if (!id) {
    return res.status(400).json({ message: 'El ID del producto es requerido' });
  }

  try {
    client = await getConnection();
    const result = await client.query(queries.products.deleteProduct, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o ya eliminado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  } finally {
    if (client) client.release();
  }
};