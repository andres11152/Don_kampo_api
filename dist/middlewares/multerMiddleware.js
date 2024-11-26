"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadSingleImage = void 0;
var _multer = _interopRequireDefault(require("multer"));
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});
const uploadSingleImage = exports.uploadSingleImage = upload.single('photo_url');
//# sourceMappingURL=multerMiddleware.js.map