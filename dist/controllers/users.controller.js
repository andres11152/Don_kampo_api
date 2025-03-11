import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import bcrypt from 'bcrypt';
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los usuarios
export const getUsers = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    let client;
    try {
      client = yield getConnection();
      const result = yield client.query(queries.users.getUsers);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error.message);
      res.status(500).json({
        msg: 'Error al obtener los usuarios',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function getUsers(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// Obtener un usuario por ID
export const getUsersById = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    if (!id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID válido.'
      });
    }
    let client;
    try {
      client = yield getConnection();
      const userResult = yield client.query(queries.users.getUsersById, [id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          msg: 'Usuario no encontrado.'
        });
      }
      const userData = userResult.rows[0];
      const ordersResult = yield client.query(queries.users.getUserOrdersById, [id]);
      const userOrders = ordersResult.rows;
      res.status(200).json({
        user: userData,
        orders: userOrders
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error.message);
      res.status(500).json({
        msg: 'Error interno del servidor.',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function getUsersById(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

// Crear un nuevo usuario
export const createUsers = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res) {
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

    // Se asigna un valor por defecto a lastname si no se proporciona
    const safeLastname = lastname || '';
    if (!user_name || !email || !phone || !city || !address || !neighborhood || !user_password || !user_type) {
      return res.status(400).json({
        msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
      });
    }
    let client;
    try {
      client = yield getConnection();
      const emailCheck = yield client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (emailCheck.rowCount > 0) {
        return res.status(400).json({
          msg: 'El correo electrónico ya está registrado.'
        });
      }
      const hashedPassword = yield bcrypt.hash(user_password, 10);
      yield client.query(queries.users.createUsers, [user_name, safeLastname, email, phone, city, address, neighborhood, hashedPassword, user_type]);
      res.status(201).json({
        msg: 'Usuario creado exitosamente.'
      });
    } catch (error) {
      console.error('Error al crear usuario:', error.message);
      res.status(500).json({
        msg: 'Error interno del servidor, intente nuevamente.',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function createUsers(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

// Actualizar la información de un usuario
export const updateUsers = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res) {
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
    let client;
    try {
      client = yield getConnection();
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
        const hashedPassword = yield bcrypt.hash(user_password, 10);
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
      const result = yield client.query(query, values);
      if (result.rowCount === 0) {
        return res.status(404).json({
          msg: 'Usuario no encontrado.'
        });
      }
      res.status(200).json({
        msg: 'Usuario actualizado exitosamente.'
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error.message);
      res.status(500).json({
        msg: 'Error interno del servidor.',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function updateUsers(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

// Eliminar un usuario
export const deleteUsers = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    if (!id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID válido.'
      });
    }
    let client;
    try {
      client = yield getConnection();
      const result = yield client.query(queries.users.deleteUsers, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({
          msg: 'Usuario no encontrado.'
        });
      }
      res.status(200).json({
        msg: 'Usuario eliminado exitosamente.'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error.message);
      res.status(500).json({
        msg: 'Error interno del servidor.',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function deleteUsers(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

// Actualizar el estado de un usuario
export const updateUserStatus = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (req, res) {
    const {
      id,
      status_id
    } = req.params;
    if (!id || !status_id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID de usuario y un nuevo estado válido.'
      });
    }
    let client;
    try {
      client = yield getConnection();
      yield client.query(queries.users.updateUserStatus, [id, status_id]);
      res.status(200).json({
        msg: 'Estado del usuario actualizado exitosamente.'
      });
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error.message);
      res.status(500).json({
        msg: 'Error interno del servidor.',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return function updateUserStatus(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();