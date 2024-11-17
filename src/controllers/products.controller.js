import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  const { page = 1, limit = 90 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const client = await getConnection();
    const result = await client.query(queries.products.getProducts, [limit, offset]);

    const productsMap = {};
    for (const product of result.rows) {
      if (!productsMap[product.product_id]) {
        productsMap[product.product_id] = {
          ...product,
          variations: [],
        };
      }
    }

    for (const productId in productsMap) {
      const variationsResult = await client.query(queries.products.getProductVariations, [productId]);
      productsMap[productId].variations = variationsResult.rows;
    }

    client.release();
    const productsWithVariations = Object.values(productsMap);
    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
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
  try {
    const { name, description, category, stock, variations } = req.body;

    // Verificar si variations no está presente o es null
    const hasVariations = Array.isArray(variations) && variations.length > 0;

    const photo = req.file ? req.file.buffer : null;
    const client = await getConnection();

    const result = await client.query(
      queries.products.createProduct,
      [name, description, category, stock, photo]
    );

    const productId = result.rows[0].product_id;

    // Si hay variaciones, se procesan
    if (hasVariations) {
      for (const variation of variations) {
        await client.query(queries.products.createProductVariation, [
          productId,
          variation.quality,
          variation.quantity,
          variation.price_home,
          variation.price_supermarket,
          variation.price_restaurant,
          variation.price_fruver,
        ]);
      }
    }

    client.release();
    res.status(201).json({ message: 'Producto creado exitosamente', product_id: productId });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
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
