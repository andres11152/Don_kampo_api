"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var JWT_SECRET = 'Xpto-secret0-key';
var verifyToken = exports.verifyToken = function verifyToken(req, res, next) {
  try {
    var authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        message: 'Token de autenticación no proporcionado o formato incorrecto.'
      });
    }
    var token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({
        message: 'Token de autenticación no encontrado.'
      });
    }
    var decoded = _jsonwebtoken["default"].verify(token, JWT_SECRET);
    if (!decoded.id) {
      console.warn('Token decodificado pero sin ID de usuario:', decoded);
      return res.status(401).json({
        message: 'Token no contiene información válida de usuario.'
      });
    }
    req.user = decoded;
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'El token ha expirado.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token no válido.'
      });
    } else {
      return res.status(500).json({
        message: 'Error al procesar la autenticación.'
      });
    }
  }
};