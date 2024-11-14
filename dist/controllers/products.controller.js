// controlador de productos actualizado
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los productos de la base de datos (10 productos por página)

export const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10
  } = req.query;
  const offset = (page - 1) * limit;
  try {
    const client = await getConnection();
    const result = await client.query(queries.products.getProducts, [limit, offset]);
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({
      message: 'Error al obtener los productos'
    });
  }
};

// Obtener un producto por product_id
export const getProductById = async (req, res) => {
  try {
    const {
      product_id
    } = req.params; // Asegúrate de que la ruta use ':product_id' como parámetro
    const client = await getConnection();
    const result = await client.query(queries.products.getProductById, [product_id]);
    console.log("Consulta getProductById:", queries.products.getProductById);
    client.release(); // Libera la conexión después de la consulta

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({
      message: 'Error al obtener el producto'
    });
  }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      stock,
      price_home,
      price_supermarket,
      price_restaurant,
      price_fruver
    } = req.body;

    // `photo` se obtiene como un buffer desde `req.file`
    const photo = req.file ? req.file.buffer : null;
    const client = await getConnection();
    const result = await client.query(queries.products.createProduct, [name, description, category, stock, photo, price_home, price_supermarket, price_restaurant, price_fruver]);
    await client.end();
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: result.rows[0].product_id
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({
      message: 'Error al crear el producto'
    });
  }
};

// Actualizar un producto por product_id
export const updateProduct = async (req, res) => {
  try {
    const {
      product_id
    } = req.params;
    // Incluye los nuevos campos de precio en los datos recibidos
    const {
      name,
      description,
      category,
      stock,
      photo,
      price_home,
      price_supermarket,
      price_restaurant,
      price_fruver
    } = req.body;
    const client = await getConnection();

    // Actualiza la consulta para incluir los nuevos campos de precio
    await client.query(queries.products.updateProduct, [name, description, category, stock, photo, price_home, price_supermarket, price_restaurant, price_fruver, product_id]);
    await client.end();
    res.status(200).json({
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({
      message: 'Error al actualizar el producto'
    });
  }
};

// Eliminar un producto por product_id
export const deleteProduct = async (req, res) => {
  try {
    const {
      product_id
    } = req.params;
    const client = await getConnection();
    await client.query(queries.products.deleteProduct, [product_id]);
    await client.end();
    res.status(200).json({
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({
      message: 'Error al eliminar el producto'
    });
  }
};