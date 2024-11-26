"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _loginController = require("../controllers/login.controller.js");
const router = _express.default.Router();
router.post('/api/login', _loginController.loginController);
var _default = exports.default = router;
//# sourceMappingURL=auth.routes.js.map