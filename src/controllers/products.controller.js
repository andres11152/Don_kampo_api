import { getConnection } from '../database/connection.js';

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM products');
    await client.end();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getConnection();
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    
    client.release(); // Libera la conexión en lugar de cerrarla

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
    const { name, description, category, stock } = req.body;
    const client = await getConnection();
    await client.query(
      'INSERT INTO products (name, description, category, stock) VALUES ($1, $2, $3, $4)',
      [name, description, category, stock]
    );
    await client.end();
    res.status(201).json({ message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar un producto por ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, stock } = req.body;
    const client = await getConnection();
    await client.query(
      'UPDATE products SET name = $1, description = $2, category = $3, stock = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
      [name, description, category, stock, id]
    );
    await client.end();
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto por ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getConnection();
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    await client.end();
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
