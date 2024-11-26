"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginController = void 0;
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _connection = require("../database/connection.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// login.controller.js

const JWT_SECRET = 'Xpto-secret0-key';
const loginController = async (req, res) => {
  const {
    email,
    user_password
  } = req.body;
  if (!email || !user_password) {
    return res.status(400).json({
      message: 'Email y contraseña son requeridos'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos'
      });
    }
    const user = result.rows[0];
    const isMatch = await _bcrypt.default.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos'
      });
    }
    const token = _jsonwebtoken.default.sign({
      id: user.id,
      email: user.email,
      user_type: user.user_type
    }, JWT_SECRET, {
      expiresIn: '1h'
    });
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        lastname: user.lastname,
        email: user.email,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Error interno del servidor'
      });
    }
  }
};
exports.loginController = loginController;