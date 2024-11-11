// controlador de productos actualizado
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.products.getProducts);
    await client.end();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Obtener un producto por product_id
export const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params; // Asegúrate de que la ruta use ':product_id' como parámetro
    const client = await getConnection();
    const result = await client.query(queries.products.getProductById, [product_id]);
    
    client.release(); // Libera la conexión después de la consulta

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, stock, photo } = req.body; // Incluye `photo` en los datos recibidos
    const client = await getConnection();
    const result = await client.query(
      queries.products.createProduct,
      [name, description, category, stock, photo] // Incluye `photo` en la consulta
    );
    await client.end();
    res.status(201).json({ message: 'Producto creado exitosamente', product_id: result.rows[0].product_id });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar un producto por product_id
export const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { name, description, category, stock, photo } = req.body; // Incluye `photo` en los datos recibidos
    const client = await getConnection();
    await client.query(
      queries.products.updateProduct,
      [name, description, category, stock, photo, product_id] // Incluye `photo` en la consulta
    );
    await client.end();
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
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
    await client.query(queries.products.deleteProduct, [product_id]);
    await client.end();
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
