import { getConnection } from '../database/connection.js';

export const getUserProfile = async (req, res) => {
  let client; // Definir la variable client fuera del bloque try para un mejor manejo
  try {
    // Obtener el ID del usuario desde el token decodificado en `req.user` (por el middleware de autenticación)
    const userId = req.user.id;

    // Obtener la conexión a la base de datos desde el pool
    client = await getConnection(); // Usa getConnection() directamente para obtener un cliente ya conectado

    // Consultar la base de datos para obtener la información del usuario
    const result = await client.query(
      'SELECT id, user_name, phone, lastname, email, user_type FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const user = result.rows[0];
    res.status(200).json(user);
    
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
  } finally {
    // Liberar la conexión si existe
    if (client) {
      client.release();
    }
  }
};
