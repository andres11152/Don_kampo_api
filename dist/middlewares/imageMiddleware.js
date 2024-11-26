"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.optimizeImage = void 0;
var _sharp = _interopRequireDefault(require("sharp"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const optimizeImage = (req, res, next) => {
  if (req.file) {
    (0, _sharp.default)(req.file.buffer).resize(800, 800, {
      fit: 'inside'
    }).jpeg({
      quality: 80
    }).toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).send('Error al optimizar la imagen');
      }
      req.optimizedImage = buffer;
      next();
    });
  } else {
    next();
  }
};
exports.optimizeImage = optimizeImage;