import bcrypt from 'bcrypt';
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

/**
 * Obtiene todos los usuarios de la base de datos.
 */
export const getUsers = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.users.getUsers);
    res.status(200).json(result.rows);
    await client.end();
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};
/**
 * Obtiene un usuario por ID de la base de datos.
 */
export const getUsersById = async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID válido.',
      });
    }
    
    try {
      const client = await getConnection();
      const result = await client.query(queries.users.getUsersById, [id]);
      await client.end();
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);
      } else {
        return res.status(404).json({
          msg: 'Usuario no encontrado.',
        });
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return res.status(500).json({
        msg: 'Error interno del servidor.',
      });
    }
  };
    
  /**
   * Crea un nuevo usuario en la base de datos.
   */
  export const createUsers = async (req, res) => {  
    const { user_name, first_name, last_name, email, phone, departament, city, adress, neighborhood, locality,user_status, user_password } = req.body;
    
    if (!user_name || !first_name || !last_name || !email || !phone || !departament || !city || !adress || !neighborhood || !locality || !user_password) {
      return res.status(400).json({
        msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos están completos.',
        
      });
    }

    try {
        const hashedPassword = await bcrypt.hash(user_password, 10); // hash the password
        const client = await getConnection();
        await client.query(queries.users.createUsers, [user_name, first_name, last_name, email, phone, departament, city, adress, neighborhood, locality, user_status, hashedPassword]);
        await client.end();
        return res.status(201).json({
          msg: 'Usuario creado exitosamente.',
        });
      } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({
          msg: 'Error interno del servidor.',
        });
      }       

      /** Actualiza un usuario existente en la base de datos. */
      export const updateUsers = async (req, res) => {
        const { id } = req.params;
        const { first_name, last_name, email, phone, departament, city, adress, neighborhood, locality, user_status, user_password } = req.body;
      
        if (!id || !first_name || !last_name || !email || !phone || !departament || !city || !adress || !neighborhood || !locality || !user_status || !user_password) {
          return res.status(400).json({
            msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos están completos.',
            
          });
        }
      
        try {
          const hashedPassword = await bcrypt.hash(user_password, 10); // hash the password
          const client = await getConnection();
          await client.query(queries.users.updateUsers, [first_name, last_name, email, phone, departament, city, adress, neighborhood, locality, user_status, hashedPassword, id]);
          await client.end();
          return res.status(201).json({
            msg: 'Usuario actualizado exitosamente.',
          });
        } catch (error) {
        } console.error('Error al actualizar usuario:', error);
        return res.status(500).json({
          msg: 'Error interno del servidor.',
        });
      }}; 

  /**
   * Elimina un usuario de la base de datos.
   * **/ 
  export const deleteUsers = async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID válido.',
      }); 
    } 
    try {
      const client = await getConnection();
      await client.query(queries.users.deleteUsers, [id]);
      await client.end();
      return res.status(200).json({
        msg: 'Usuario eliminado exitosamente.',
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({
        msg: 'Error interno del servidor.',
      }); 
    }
};  
