import bcrypt from 'bcrypt';
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const result = await client.query(queries.users.getUsers);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ msg: 'Error al obtener los usuarios', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Obtener un usuario por ID
export const getUsersById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  let client;
  try {
    client = await getConnection();
    const userResult = await client.query(queries.users.getUsersById, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    const userData = userResult.rows[0];
    // No enviar la contraseña hasheada
    delete userData.user_password;

    const ordersResult = await client.query(queries.users.getUserOrdersById, [id]);

    // SOLUCIÓN N+1: Obtener todos los items de todas las órdenes en una sola consulta.
    const orderIds = ordersResult.rows.map(order => order.id);
    let allItems = [];
    if (orderIds.length > 0) {
      const itemsResult = await client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
      allItems = itemsResult.rows;
    }

    // Agrupar los items por order_id para una asignación eficiente.
    const itemsByOrderId = allItems.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {});

    // Asignar los items a cada orden.
    const ordersWithItems = ordersResult.rows.map(order => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    res.status(200).json({
      user: userData,
      // Enviar las órdenes con sus items
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Crear un nuevo usuario
export const createUsers = async (req, res) => {
  const { user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type } = req.body;

  // Se asigna un valor por defecto a lastname si no se proporciona
  const safeLastname = lastname || '';

  if (!user_name || !email || !phone || !city || !address || !neighborhood || !user_password || !user_type) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  let client;
  try {
    client = await getConnection();

    const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.users.createUsers, [user_name, safeLastname, email, phone, city, address, neighborhood, hashedPassword, user_type]);

    res.status(201).json({ msg: 'Usuario creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor, intente nuevamente.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Actualizar la información de un usuario
export const updateUsers = async (req, res) => {
  const { id } = req.params;
  const { user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type } = req.body;

  if (!id) {
    return res.status(400).json({ msg: 'ID del usuario es obligatorio.' });
  }

  let client;
  try {
    client = await getConnection();

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

    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    res.status(200).json({ msg: 'Usuario actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Eliminar un usuario
export const deleteUsers = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  let client;
  try {
    client = await getConnection();
    const result = await client.query(queries.users.deleteUsers, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    res.status(200).json({ msg: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Actualizar el estado de un usuario
export const updateUserStatus = async (req, res) => {
  const { id, status_id } = req.params;

  // Validación robusta de los parámetros
  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID de usuario.' });
  }

  const newStatus = parseInt(status_id, 10);
  if (isNaN(newStatus) || (newStatus !== 0 && newStatus !== 1)) {
    return res.status(400).json({
      msg: 'El estado proporcionado es inválido. Debe ser 0 o 1.'
    });
  }

  let client;
  try {
    client = await getConnection();

    // CORRECCIÓN: La consulta SQL espera el valor del estado y el ID del usuario.
    // El nombre del parámetro en la URL (`status_id`) es solo un nombre de variable.
    // Lo importante es pasar los valores en el orden correcto que la consulta espera.
    // La consulta es: UPDATE users SET status = $1 WHERE id = $2
    const result = await client.query(queries.users.updateUserStatus, [newStatus, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    res.status(200).json({ msg: 'Estado del usuario actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

// Cambiar la contraseña de un usuario autenticado
export const changePassword = async (req, res) => {
  // El ID del usuario se obtiene del token, no del body, para mayor seguridad.
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'La contraseña actual y la nueva son requeridas.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  let client;
  try {
    client = await getConnection();

    // 1. Obtener el hash de la contraseña actual del usuario
    const userResult = await client.query('SELECT user_password FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }
    const storedPasswordHash = userResult.rows[0].user_password;

    // 2. Comparar la contraseña actual proporcionada con el hash almacenado
    const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta.' });
    }

    // 3. Hashear y actualizar la nueva contraseña
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET user_password = $1 WHERE id = $2', [newHashedPassword, userId]);

    res.status(200).json({ msg: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};
