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
    client.release(); // Cambiado de client.end() a client.release()
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({ msg: 'Error al obtener los usuarios' });
  }
};

/**
 * Obtiene un usuario por ID de la base de datos.
 */
export const getUsersById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();

    // Obtener la información del usuario
    const userResult = await client.query(queries.users.getUsersById, [id]);

    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    const userData = userResult.rows[0];

    // Obtener las órdenes asociadas al usuario
    const ordersResult = await client.query(queries.users.getUserOrdersById, [id]);
    const userOrders = ordersResult.rows;

    client.release();

    // Responder con la información del usuario y sus órdenes
    return res.status(200).json({
      user: userData,
      orders: userOrders,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Crea un nuevo usuario en la base de datos.
 */
export const createUsers = async (req, res) => {
  const { user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type } = req.body;

  // Validación de campos
  if (!user_name || !lastname || !email || !phone || !city || !address || !neighborhood || !user_password || !user_type) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Verificar si el email ya existe
    const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      client.release();
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
    }

    // Hashear la contraseña y crear el usuario
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.users.createUsers, [user_name, lastname, email, phone, city, address, neighborhood, hashedPassword, user_type]);


    client.release();
    return res.status(201).json({ msg: 'Usuario creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ msg: 'Error interno del servidor, intente nuevamente.' });
  }
};
/**
 * Actualiza un usuario existente en la base de datos.
 */
export const updateUsers = async (req, res) => {
  const { id } = req.params;
  const { user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type } = req.body;

  if (!id) {
    return res.status(400).json({ msg: 'ID del usuario es obligatorio.' });
  }

  try {
    const client = await getConnection();

    // Construcción dinámica de los campos a actualizar
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (user_name) { updates.push(`user_name = $${paramIndex++}`); values.push(user_name); }
    if (lastname) { updates.push(`lastname = $${paramIndex++}`); values.push(lastname); }
    if (email) { updates.push(`email = $${paramIndex++}`); values.push(email); }
    if (phone) { updates.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (city) { updates.push(`city = $${paramIndex++}`); values.push(city); }
    if (address) { updates.push(`address = $${paramIndex++}`); values.push(address); }
    if (neighborhood) { updates.push(`neighborhood = $${paramIndex++}`); values.push(neighborhood); }
    if (user_password) { 
      const hashedPassword = await bcrypt.hash(user_password, 10);
      updates.push(`user_password = $${paramIndex++}`); 
      values.push(hashedPassword);
    }
    if (user_type) { updates.push(`user_type = $${paramIndex++}`); values.push(user_type); }

    values.push(id); // Añade el id al final de los valores

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    return res.status(200).json({ msg: 'Usuario actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};


/**
 * Elimina un usuario de la base de datos.
 */
export const deleteUsers = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido en el controlador:", id); // Log para verificar el ID recibido

  // Validación del ID
  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    console.log("Conexión establecida con la base de datos");

    // Ejecutar la consulta para eliminar
    const result = await client.query(queries.users.deleteUsers, [id]); // Asegúrate de que la consulta esté correcta
    console.log("Resultado de la consulta DELETE:", result);

    client.release();

    // Verificar si se eliminó algún registro
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    return res.status(200).json({ msg: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error); // Log para mostrar cualquier error
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id, status_id } = req.params;

  // Validación de los datos de entrada
  if (!id || !status_id) {
    return res.status(400).json({
      msg: 'Por favor proporciona un ID de usuario y un nuevo estado válido.'
    });
  }

  try {
    const client = await getConnection();
    // Ejecuta la consulta para actualizar solo el estado
    await client.query(queries.users.updateUserStatus, [ id, status_id ]);
    client.release();
    return res.status(200).json({ msg: 'Estado del usuario actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};



