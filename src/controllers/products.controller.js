import { getConnection } from "../database/connection.js";
import { uploadImage } from "../helpers/uploadImage.js";
import { queries } from "../database/queries.interface.js";

export const getProducts = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const offset = (page - 1) * limit;
  let client;
  try {
    client = await getConnection();
    const productsResult = await client.query(queries.products.getProducts, [
      offset,
      limit,
    ]);
    if (productsResult.rows.length === 0) {
      return res.status(404).json({ message: "No hay productos disponibles" });
    }
    const productsWithVariations = productsResult.rows.reduce((acc, row) => {
      const existingProduct = acc.find(
        (product) => product.product_id === row.product_id
      );
      const variation = {
        variation_id: row.variation_id,
        quality: row.quality,
        quantity: row.quantity,
        price_home: row.price_home,
        price_supermarket: row.price_supermarket,
        price_restaurant: row.price_restaurant,
        price_fruver: row.price_fruver,
      };
      if (existingProduct) {
        existingProduct.variations.push(variation);
      } else {
        acc.push({
          product_id: row.product_id,
          name: row.name,
          description: row.description,
          category: row.category,
          stock: row.stock,
          photo_url: row.photo_url,
          variations: row.variation_id ? [variation] : [],
        });
      }
      return acc;
    }, []);
    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error(
      "Error al obtener los productos:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error al obtener los productos" });
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
      [id]
    );

    const productWithVariations = {
      ...productResult.rows[0],
      variations: variationsResult.rows,
    };

    res.status(200).json(productWithVariations);
  } catch (error) {
    console.error("Error al obtener el producto por ID:", error);
    res.status(500).json({ message: "Error al obtener el producto" });
  } finally {
    if (client) client.release();
  }
};

export const createProduct = async (req, res) => {
  let client;

  try {
    const { name, description, category, stock, variations } = req.body;

    // Manejo de imágenes: validación explícita
    const defaultPhotoUrl = "https://example.com/default-image.jpg";
    let photoUrl = defaultPhotoUrl;

    if (req.file && req.file.buffer) {
      try {
        photoUrl = await uploadImage(req.file.buffer, req.file.originalname);
      } catch (error) {
        console.error("Error al subir la imagen:", error.message);
        return res
          .status(500)
          .json({ message: "Error al subir la imagen a S3" });
      }
    }

    const validatedStock = stock ? parseInt(stock, 10) : 0;

    // Conexión a la base de datos
    client = await getConnection();

    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      validatedStock,
      photoUrl,
    ]);

    const productId = result.rows[0].product_id;

    // Manejo de variaciones
    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        const {
          quality,
          quantity,
          price_home,
          price_supermarket,
          price_restaurant,
          price_fruver,
        } = variation;

        if (!quality || !quantity) continue;

        await client.query(queries.products.createProductVariation, [
          productId,
          quality,
          quantity,
          parseFloat(price_home || 0),
          parseFloat(price_supermarket || 0),
          parseFloat(price_restaurant || 0),
          parseFloat(price_fruver || 0),
        ]);
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

export const updateProduct = async (req, res) => {
  let client;
  const { id } = req.params;

  const { name, description, category, stock, photo_url, variations } =
    req.body;

  const parsedProductId = parseInt(id, 10);

  if (isNaN(parsedProductId)) {
    return res.status(400).json({ message: "ID del producto inválido" });
  }

  try {
    client = await getConnection();
    const updatedPhotoUrl = photo_url || null;

    if (!queries.products.updateProduct) {
      return res.status(500).json({ message: "Error en la consulta SQL" });
    }
    if (!queries.products.updateProduct) {
      throw new Error("La consulta updateProduct no está definida.");
    }
    const result = await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      stock,
      updatedPhotoUrl,
      parsedProductId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (Array.isArray(variations) && variations.length > 0) {
      await client.query(queries.products.deleteProductVariation, [
        parsedProductId,
      ]);

      for (const variation of variations) {
        await client.query(queries.products.createProductVariation, [
          parsedProductId,
          variation.quality,
          variation.quantity,
          parseFloat(variation.price_home || 0),
          parseFloat(variation.price_supermarket || 0),
          parseFloat(variation.price_restaurant || 0),
          parseFloat(variation.price_fruver || 0),
        ]);
      }
    }

    res.status(200).json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto" });
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
    res.status(500).json({ message: "Error al eliminar el producto" });
  } finally {
    if (client) client.release();
  }
};

export const updateMultipleProducts = async (req, res) => {
  let client;
  const products = req.body;

  // Verificar que el array de productos esté presente y no esté vacío
  if (!Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({
        message: "Debe proporcionar un array de productos para actualizar.",
      });
  }

  try {
    client = await getConnection();
    await client.query("BEGIN"); // Iniciar transacción

    for (const product of products) {
      const {
        product_id, // ID del producto
        name,
        description,
        category,
        stock,
        variations,
        photo_url = null, // Foto, que puede ser nula
      } = product;

      // Validar el ID del producto
      const parsedProductId = parseInt(product_id, 10);
      if (isNaN(parsedProductId)) {
        throw new Error(`ID del producto inválido: ${product_id}`);
      }

      // Validar la consulta de actualización del producto
      if (!queries.products.updateProduct) {
        throw new Error("Consulta SQL para actualizar producto no definida.");
      }

      // Actualizar el producto principal
      const result = await client.query(queries.products.updateProduct, [
        name,
        description,
        category,
        stock,
        photo_url || null, // Si photo_url es vacío, se envía como null
        parsedProductId,
      ]);

      if (result.rowCount === 0) {
        throw new Error(`Producto con ID: ${product_id} no encontrado.`);
      }

      // Manejar las variaciones del producto, si existen
      if (Array.isArray(variations) && variations.length > 0) {
        for (const variation of variations) {
          const {
            variation_id,
            quality,
            quantity,
            price_home,
            price_supermarket,
            price_restaurant,
            price_fruver,
          } = variation;

          if (variation_id) {
            // Actualizar una variación existente
            await client.query(queries.products.updateProductVariation, [
              quality,
              quantity,
              parseFloat(price_home || 0),
              parseFloat(price_supermarket || 0),
              parseFloat(price_restaurant || 0),
              parseFloat(price_fruver || 0),
              variation_id,
            ]);
          } else {
            // Crear una nueva variación
            await client.query(queries.products.createProductVariation, [
              parsedProductId,
              quality,
              quantity,
              parseFloat(price_home || 0),
              parseFloat(price_supermarket || 0),
              parseFloat(price_restaurant || 0),
              parseFloat(price_fruver || 0),
            ]);
          }
        }
      }
    }

    // Confirmar transacción
    await client.query("COMMIT");
    res.status(200).json({ message: "Productos actualizados exitosamente." });
  } catch (error) {
    console.error("Error al actualizar los productos:", error);

    if (client) {
      await client.query("ROLLBACK"); // Revertir transacción en caso de error
    }

    res.status(500).json({
      message: "Error al actualizar los productos.",
      error: error.message,
    });
  } finally {
    if (client) client.release(); // Liberar cliente
  }
};
