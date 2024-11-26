"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadSingleImage = void 0;
var _multer = _interopRequireDefault(require("multer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});
const uploadSingleImage = exports.uploadSingleImage = upload.single('photo_url');