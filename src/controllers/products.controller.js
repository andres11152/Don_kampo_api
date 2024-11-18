import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  const { page = 1, limit = 90 } = req.query;
  const offset = (page - 1) * limit;
  let client;

  try {
    client = await getConnection();

    const result = await client.query(queries.products.getProducts, [limit, offset]);

    const productsMap = {};
    for (const product of result.rows) {
      if (!productsMap[product.product_id]) {
        productsMap[product.product_id] = {
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          category: product.category,
          stock: product.stock,
          photo: product.photo || null, // Devolver binario directamente
          variations: [],
        };
      }
    }

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

    res.status(200).json(Object.values(productsMap));
  } catch (error) {
    console.error('Error al obtener los productos:', error);

    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  } finally {
    if (client) client.release();
  }
};


export const getProductById = async (req, res) => {
  let client;

  try {
    const { product_id } = req.params;
    client = await getConnection();

    const result = await client.query(queries.products.getProductById, [product_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const product = result.rows[0];
    product.photo = product.photo ? `data:image/jpeg;base64,${product.photo.toString('base64')}` : null;

    const variationsResult = await client.query(queries.products.getProductVariations, [product_id]);
    product.variations = variationsResult.rows;

    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  } finally {
    if (client) client.release();
  }
};

export const createProduct = async (req, res) => {
  let client;

  try {
    const { name, description, category, stock, variations } = req.body;
    const photoBuffer = req.file?.buffer || null;
    console.log("Photo buffer:", req.file?.buffer);

    const validatedStock = stock ? parseInt(stock, 10) : null;

    client = await getConnection();

    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      validatedStock,
      photoBuffer,
    ]);

    const productId = result.rows[0].product_id;

    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        await client.query(queries.products.createProductVariation, [
          productId,
          variation.quality,
          variation.quantity,
          parseFloat(variation.price_home || 0),
          parseFloat(variation.price_supermarket || 0),
          parseFloat(variation.price_restaurant || 0),
          parseFloat(variation.price_fruver || 0),
        ]);
      }
    }

    res.status(201).json({ message: 'Producto creado exitosamente', product_id: productId });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al crear el producto' });
    }
  } finally {
    if (client) client.release();
  }
};

export const updateProduct = async (req, res) => {
  let client;

  try {
    const { product_id } = req.params;
    const { name, description, category, stock, variations } = req.body;
    const photoBuffer = req.file?.buffer || null;

    client = await getConnection();

    await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      parseInt(stock, 10),
      photoBuffer,
      product_id,
    ]);

    await client.query('DELETE FROM product_variations WHERE product_id = $1', [product_id]);

    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        await client.query(queries.products.createProductVariation, [
          product_id,
          variation.quality,
          variation.quantity,
          parseFloat(variation.price_home || 0),
          parseFloat(variation.price_supermarket || 0),
          parseFloat(variation.price_restaurant || 0),
          parseFloat(variation.price_fruver || 0),
        ]);
      }
    }

    res.status(200).json({ message: 'Producto y variaciones actualizadas exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  } finally {
    if (client) client.release();
  }
};

export const deleteProduct = async (req, res) => {
  let client;

  try {
    const { product_id } = req.params;
    client = await getConnection();

    await client.query(queries.products.deleteProductVariation, [product_id]);
    await client.query(queries.products.deleteProduct, [product_id]);

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  } finally {
    if (client) client.release();
  }
};
