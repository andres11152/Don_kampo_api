import { Router } from 'express';
import { getUsers, getUsersById, createUsers, updateUsers, updateUserStatus, deleteUsers } from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requestPasswordReset, verifyCodeAndResetPassword } from '../controllers/resetPassword.controller.js';
const router = Router();
router.get('/api/users', getUsers);
router.get('/api/users/:id', getUsersById);
router.post('/api/createusers', createUsers);
router.put('/api/updateusers/:id', updateUsers);
router.delete('/api/deleteusers/:id', deleteUsers);
router.get('/api/profile', verifyToken, getUserProfile);
router.put('/api/userstatus/:id/:status_id', updateUserStatus);
router.post('/api/request-password-reset', requestPasswordReset);
router.post('/api/verify-code-and-reset-password', verifyCodeAndResetPassword);
export default router;
//# sourceMappingURL=user.routes.js.map