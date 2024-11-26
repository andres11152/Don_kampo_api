"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _ordersController = require("../controllers/orders.controller.js");
const router = (0, _express.Router)();
router.post('/api/orders/placeOrder', _ordersController.placeOrder);
router.get('/api/orders', _ordersController.getOrders);
router.get('/api/orders/:orderId', _ordersController.getOrdersById);
router.post('/api/createorders', _ordersController.createOrders);
router.put('/api/updateorders/:orderId', _ordersController.updateOrders);
router.delete('/api/deleteorders/:orderId', _ordersController.deleteOrders);
router.put('/api/updatestatus/:id/:status_id', _ordersController.updateOrderStatus);
var _default = exports.default = router;
//# sourceMappingURL=order.routes.js.map