import express from 'express';
import { loginController } from '../controllers/login.controller.js';
const router = express.Router();
router.post('/api/login', loginController);
export default router;
//# sourceMappingURL=auth.routes.js.map