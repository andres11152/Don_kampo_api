// login.routes.js
import express from 'express';
import { loginController } from '../controllers/login.controller.js';
const router = express.Router();

// Ruta de inicio de sesión
router.post('/api/login', loginController);
export default router;