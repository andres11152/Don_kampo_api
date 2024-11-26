"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = exports.parseMultipartData = exports.handleMulterError = void 0;
var _multer = _interopRequireDefault(require("multer"));
const storage = _multer.default.memoryStorage();
const upload = exports.upload = (0, _multer.default)({
  storage
}).single('photo_url');
const handleMulterError = (err, req, res, next) => {
  if (err instanceof _multer.default.MulterError) {
    return res.status(400).json({
      message: `Error en la carga del archivo: ${err.message}`
    });
  }
  if (err) {
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
  next();
};
exports.handleMulterError = handleMulterError;
const parseMultipartData = (req, res, next) => {
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
exports.parseMultipartData = parseMultipartData;
//# sourceMappingURL=validateData.js.map