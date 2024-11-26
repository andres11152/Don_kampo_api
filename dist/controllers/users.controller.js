"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUsers = exports.updateUserStatus = exports.getUsersById = exports.getUsers = exports.deleteUsers = exports.createUsers = void 0;
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _connection = require("../database/connection.js");
var _queriesInterface = require("../database/queries.interface.js");
// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.users.getUsers);
    client.release();
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({
      msg: 'Error al obtener los usuarios'
    });
  }
};

// Obtener un usuario por ID
exports.getUsers = getUsers;
const getUsersById = async (req, res) => {
  const {
    id
  } = req.params;
  if (!id) {
    return res.status(400).json({
      msg: 'Por favor proporciona un ID válido.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const userResult = await client.query(_queriesInterface.queries.users.getUsersById, [id]);
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        msg: 'Usuario no encontrado.'
      });
    }
    const userData = userResult.rows[0];
    const ordersResult = await client.query(_queriesInterface.queries.users.getUserOrdersById, [id]);
    const userOrders = ordersResult.rows;
    client.release();
    return res.status(200).json({
      user: userData,
      orders: userOrders
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

// Crear un nuevo usuario
exports.getUsersById = getUsersById;
const createUsers = async (req, res) => {
  const {
    user_name,
    lastname,
    email,
    phone,
    city,
    address,
    neighborhood,
    user_password,
    user_type
  } = req.body;
  if (!user_name || !lastname || !email || !phone || !city || !address || !neighborhood || !user_password || !user_type) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      client.release();
      return res.status(400).json({
        msg: 'El correo electrónico ya está registrado.'
      });
    }
    const hashedPassword = await _bcrypt.default.hash(user_password, 10);
    await client.query(_queriesInterface.queries.users.createUsers, [user_name, lastname, email, phone, city, address, neighborhood, hashedPassword, user_type]);
    client.release();
    return res.status(201).json({
      msg: 'Usuario creado exitosamente.'
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor, intente nuevamente.'
    });
  }
};

// Actualizar la información de un usuario
exports.createUsers = createUsers;
const updateUsers = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    user_name,
    lastname,
    email,
    phone,
    city,
    address,
    neighborhood,
    user_password,
    user_type
  } = req.body;
  if (!id) {
    return res.status(400).json({
      msg: 'ID del usuario es obligatorio.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (user_name) {
      updates.push(`user_name = $${paramIndex++}`);
      values.push(user_name);
    }
    if (lastname) {
      updates.push(`lastname = $${paramIndex++}`);
      values.push(lastname);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (city) {
      updates.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    if (address) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (neighborhood) {
      updates.push(`neighborhood = $${paramIndex++}`);
      values.push(neighborhood);
    }
    if (user_password) {
      const hashedPassword = await _bcrypt.default.hash(user_password, 10);
      updates.push(`user_password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    if (user_type) {
      updates.push(`user_type = $${paramIndex++}`);
      values.push(user_type);
    }
    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await client.query(query, values);
    client.release();
    if (result.rowCount === 0) {
      return res.status(404).json({
        msg: 'Usuario no encontrado.'
      });
    }
    return res.status(200).json({
      msg: 'Usuario actualizado exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

// Eliminar un usuario
exports.updateUsers = updateUsers;
const deleteUsers = async (req, res) => {
  const {
    id
  } = req.params;
  if (!id) {
    return res.status(400).json({
      msg: 'Por favor proporciona un ID válido.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.users.deleteUsers, [id]);
    client.release();
    if (result.rowCount === 0) {
      return res.status(404).json({
        msg: 'Usuario no encontrado.'
      });
    }
    return res.status(200).json({
      msg: 'Usuario eliminado exitosamente.'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

// Actualizar el estado de un usuario
exports.deleteUsers = deleteUsers;
const updateUserStatus = async (req, res) => {
  const {
    id,
    status_id
  } = req.params;
  if (!id || !status_id) {
    return res.status(400).json({
      msg: 'Por favor proporciona un ID de usuario y un nuevo estado válido.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    await client.query(_queriesInterface.queries.users.updateUserStatus, [id, status_id]);
    client.release();
    return res.status(200).json({
      msg: 'Estado del usuario actualizado exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=users.controller.js.map