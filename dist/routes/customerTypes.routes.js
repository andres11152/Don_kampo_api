"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _customerTypesController = require("../controllers/customerTypesController.js");
var router = (0, _express.Router)();
router.get('/api/customer-types', _customerTypesController.getCustomerTypes);
router.put('/api/customer-types/shipping-costs', _customerTypesController.updateAllShippingCosts);
var _default = exports["default"] = router;