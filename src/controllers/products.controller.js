import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los productos de la base de datos con sus variaciones
export const getProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const client = await getConnection();
    const result = await client.query(queries.products.getProducts, [limit, offset]);
    
    // Obtenemos las variaciones de cada producto
    const productsWithVariations = await Promise.all(result.rows.map(async (product) => {
      const variationsResult = await client.query(queries.products.getProductVariations, [product.product_id]);
      product.variations = variationsResult.rows;  // Añadimos las variaciones a cada producto
      return product;
    }));

    client.release();
    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Obtener un producto por product_id con sus variaciones
export const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const client = await getConnection();

    // Consulta para obtener el producto
    const result = await client.query(queries.products.getProductById, [product_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const product = result.rows[0];

    // Obtener las variaciones del producto
    const variationsResult = await client.query(queries.products.getProductVariations, [product_id]);
    product.variations = variationsResult.rows;

    client.release();
    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto con variaciones
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      stock,
      variations,  // Variaciones de producto (con sus precios)
    } = req.body;

    const photo = req.file ? req.file.buffer : null;
    const client = await getConnection();

    // Crear el producto
    const result = await client.query(
      queries.products.createProduct,
      [name, description, category, stock, photo]
    );
    const productId = result.rows[0].product_id;

    // Crear las variaciones del producto
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

    client.release();
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: productId,
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const {
      name,
      description,
      category,
      stock,
      photo,
      variations,  // Nuevas variaciones que se actualizarán
    } = req.body;

    const client = await getConnection();

    // Actualizamos el producto en la tabla products
    await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      stock,
      photo,
      product_id,
    ]);

    // Eliminamos las variaciones existentes
    await client.query('DELETE FROM product_variations WHERE product_id = $1', [product_id]);

    // Insertamos las nuevas variaciones
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

// Eliminar un producto por product_id
export const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const client = await getConnection();

    // Eliminamos las variaciones del producto
    await client.query(queries.products.deleteProductVariation, [product_id]);

    // Eliminamos el producto
    await client.query(queries.products.deleteProduct, [product_id]);

    client.release();
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
