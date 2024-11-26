"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _shippingController = require("../controllers/shipping.controller.js");
const router = _express.default.Router();
router.post('/api/createshipping', _shippingController.createShippingInfo);
router.get('/api/shipping', _shippingController.getShippingInfo);
router.get('/api/getshipping/:id', _shippingController.getShippingInfoById);
router.put('/api/updateshipping/:id', _shippingController.updateShippingInfo);
router.delete('/api/deleteshipping/:id', _shippingController.deleteShippingInfo);
var _default = exports.default = router;
//# sourceMappingURL=shipping.routes.js.map