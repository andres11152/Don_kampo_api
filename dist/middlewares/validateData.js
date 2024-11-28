"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = exports.parseMultipartData = exports.handleMulterError = void 0;
var _multer = _interopRequireDefault(require("multer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var storage = _multer["default"].memoryStorage();
var upload = exports.upload = (0, _multer["default"])({
  storage: storage
}).single('photo_url');
var handleMulterError = exports.handleMulterError = function handleMulterError(err, req, res, next) {
  if (err instanceof _multer["default"].MulterError) {
    return res.status(400).json({
      message: "Error en la carga del archivo: ".concat(err.message)
    });
  }
  if (err) {
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
  next();
};
var parseMultipartData = exports.parseMultipartData = function parseMultipartData(req, res, next) {
  try {
    if (req.body.variations) {
      req.body.variations = JSON.parse(req.body.variations);
    }
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Error al procesar los datos de variaciones'
    });
  }
};