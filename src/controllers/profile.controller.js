import { getConnection } from '../database/connection.js';

export const getUserProfile = async (req, res) => {
  let client;
  try {
    // Validación del usuario
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }

    // Establecer conexión a la base de datos
    client = await getConnection();

    // Consulta para obtener el perfil del usuario
    const result = await client.query(
      'SELECT id, user_name, phone, lastname, email, user_type FROM users WHERE id = $1',
      [userId]
    );

    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Retornar el perfil del usuario
    const user = result.rows[0];
    res.status(200).json(user);
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener el perfil del usuario:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener el perfil del usuario', 
      error: error.message 
    });
  } finally {
    // Liberar la conexión a la base de datos
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error al liberar la conexión:', releaseError.message);
      }
    }
  }
};
