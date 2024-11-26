"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _usersController = require("../controllers/users.controller.js");
var _profileController = require("../controllers/profile.controller.js");
var _authMiddleware = require("../middlewares/auth.middleware.js");
var _resetPasswordController = require("../controllers/resetPassword.controller.js");
const router = (0, _express.Router)();
router.get('/api/users', _usersController.getUsers);
router.get('/api/users/:id', _usersController.getUsersById);
router.post('/api/createusers', _usersController.createUsers);
router.put('/api/updateusers/:id', _usersController.updateUsers);
router.delete('/api/deleteusers/:id', _usersController.deleteUsers);
router.get('/api/profile', _authMiddleware.verifyToken, _profileController.getUserProfile);
router.put('/api/userstatus/:id/:status_id', _usersController.updateUserStatus);
router.post('/api/request-password-reset', _resetPasswordController.requestPasswordReset);
router.post('/api/verify-code-and-reset-password', _resetPasswordController.verifyCodeAndResetPassword);
var _default = exports.default = router;
//# sourceMappingURL=user.routes.js.map