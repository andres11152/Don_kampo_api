import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getConnection } from '../database/connection.js';
export const getUserProfile = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    let client;
    try {
      const userId = req.user.id;
      client = yield getConnection();
      const result = yield client.query('SELECT id, user_name, phone, lastname, email, user_type FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }
      const user = result.rows[0];
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({
        message: 'Error al obtener el perfil del usuario'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });
  return function getUserProfile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();