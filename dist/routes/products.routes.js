"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _multer = _interopRequireDefault(require("multer"));
var _productsController = require("../controllers/products.controller.js");
var _validateData = require("../middlewares/validateData.js");
var _imageMiddleware = require("../middlewares/imageMiddleware.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var storage = _multer["default"].memoryStorage();
var upload = (0, _multer["default"])({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
var router = _express["default"].Router();
router.post('/api/createproduct', upload.single('photo_url'), _validateData.handleMulterError, _imageMiddleware.optimizeImage, _validateData.parseMultipartData, _productsController.createProduct);
router.get('/api/products', _productsController.getProducts);
router.get('/api/getproduct/:id', _productsController.getProductById);
router.put('/api/updateproduct/:id', _validateData.handleMulterError, _productsController.updateProduct);
router["delete"]('/api/deleteproduct/:id', _productsController.deleteProduct);
var _default = exports["default"] = router;