import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  const { page = 1, limit = 90 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const client = await getConnection();

    // Consulta principal
    const result = await client.query(queries.products.getProducts, [limit, offset]);

    // Mapeo de productos
    const productsMap = {};
    for (const product of result.rows) {
      if (!productsMap[product.product_id]) {
        productsMap[product.product_id] = {
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          category: product.category,
          stock: product.stock,
          photo: product.photo ? `data:image/jpeg;base64,${product.photo.toString('base64')}` : null,
          variations: [],
        };
      }
    }

    // Obtener variaciones asociadas
    const productIds = Object.keys(productsMap).map(Number);
    if (productIds.length > 0) {
      const variationsResult = await client.query(queries.products.getProductVariationsByProductIds, [productIds]);

      for (const variation of variationsResult.rows) {
        if (productsMap[variation.product_id]) {
          productsMap[variation.product_id].variations.push({
            quality: variation.quality,
            quantity: variation.quantity,
            price_home: parseFloat(variation.price_home),
            price_supermarket: parseFloat(variation.price_supermarket),
            price_restaurant: parseFloat(variation.price_restaurant),
            price_fruver: parseFloat(variation.price_fruver),
          });
        }
      }
    }

    client.release();

    // Enviar la respuesta
    const productsWithVariations = Object.values(productsMap);
    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener los productos:', error);

    // Asegurarse de liberar el cliente si ocurre un error
    if (error.client) {
      error.client.release();
    }

    // Enviar solo una respuesta de error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  }
};


export const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const client = await getConnection();

    const result = await client.query(queries.products.getProductById, [product_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const product = result.rows[0];

    // Convertir la foto de formato binario (BYTEA) a Base64
    product.photo = product.photo
      ? `data:image/jpeg;base64,${product.photo.toString('base64')}`
      : null;

    const variationsResult = await client.query(queries.products.getProductVariations, [product_id]);
    product.variations = variationsResult.rows;

    client.release();
    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const createProduct = async (req, res) => {
  let client;

  try {
    const { name, description, category, stock, variations, photo } = req.body;

    // Validar stock (convertir vacío a null)
    const validatedStock = stock && stock !== "" ? parseInt(stock, 10) : null;

    let photoBuffer = null;

    // Manejar el campo photo
    if (photo) {
      if (typeof photo === 'string') {
        try {
          photoBuffer = Buffer.from(photo, 'base64'); // Convertir Base64 a binario
        } catch (err) {
          return res.status(400).json({ message: 'Formato de foto inválido. Debe ser una cadena Base64 válida.' });
        }
      } else if (Buffer.isBuffer(photo)) {
        photoBuffer = photo; // Si ya es un binario
      } else {
        return res.status(400).json({ message: 'El campo photo debe ser una cadena Base64 o un binario válido.' });
      }
    }

    // Conexión a la base de datos
    client = await getConnection();

    // Insertar el producto
    const result = await client.query(
      queries.products.createProduct,
      [name, description, category, validatedStock, photoBuffer]
    );

    const productId = result.rows[0].product_id;

    // Insertar variaciones, si existen
    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        const validatedPriceHome = variation.price_home && variation.price_home !== "" ? parseFloat(variation.price_home) : null;
        const validatedPriceSupermarket = variation.price_supermarket && variation.price_supermarket !== "" ? parseFloat(variation.price_supermarket) : null;
        const validatedPriceRestaurant = variation.price_restaurant && variation.price_restaurant !== "" ? parseFloat(variation.price_restaurant) : null;
        const validatedPriceFruver = variation.price_fruver && variation.price_fruver !== "" ? parseFloat(variation.price_fruver) : null;

        await client.query(queries.products.createProductVariation, [
          productId,
          variation.quality,
          variation.quantity,
          validatedPriceHome,
          validatedPriceSupermarket,
          validatedPriceRestaurant,
          validatedPriceFruver,
        ]);
      }
    }

    // Liberar la conexión y enviar respuesta
    client.release();
    res.status(201).json({ message: 'Producto creado exitosamente', product_id: productId });
  } catch (error) {
    console.error('Error al crear el producto:', error);

    // Liberar la conexión en caso de error
    if (client) {
      client.release();
    }

    // Asegurarse de no enviar múltiples respuestas
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al crear el producto' });
    }
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { name, description, category, stock, photo, variations } = req.body;
    const client = await getConnection();

    await client.query(queries.products.updateProduct, [name, description, category, stock, photo, product_id]);
    await client.query('DELETE FROM product_variations WHERE product_id = $1', [product_id]);

    for (const variation of variations) {
      await client.query(queries.products.createProductVariation, [
        product_id,
        variation.quality,
        variation.quantity,
        variation.price_home,
        variation.price_supermarket,
        variation.price_restaurant,
        variation.price_fruver,
      ]);
    }

    client.release();
    res.status(200).json({ message: 'Producto y variaciones actualizadas exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const client = await getConnection();

    await client.query(queries.products.deleteProductVariation, [product_id]);
    await client.query(queries.products.deleteProduct, [product_id]);

    client.release();
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
