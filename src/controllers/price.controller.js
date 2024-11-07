import { getConnection } from '../database/connection.js';

export const getPriceList = async (req, res) => {
  try {
    const { user_type } = req.params; // Supone que pasas el tipo de usuario en los parámetros de la solicitud
    const client = await getConnection(); // Establece la conexión con la base de datos
    
    const result = await client.query(
      'SELECT p.name, pr.price FROM products p JOIN prices pr ON p.id = pr.product_id WHERE pr.customer_type = $1',
      [user_type] // Pasa el tipo de usuario como parámetro para filtrar los resultados
    );
    
    await client.end(); // Cierra la conexión a la base de datos
    res.status(200).json(result.rows); // Envía la lista de precios como respuesta en formato JSON
  } catch (error) {
    console.error('Error al obtener la lista de precios:', error);
    res.status(500).json({ message: 'Error al obtener la lista de precios' }); // Respuesta de error en caso de fallo
  }
};
