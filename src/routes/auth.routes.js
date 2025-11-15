import express from 'express';
import { loginController } from '../controllers/login.controller.js';

// Este archivo define las rutas relacionadas con la autenticación.
// Es el punto de entrada para que los usuarios obtengan tokens de acceso (JWT)
// que les permitirán interactuar con las rutas protegidas de la API.
const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión de usuario
 *     description: Autentica a un usuario mediante su correo y contraseña.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credenciales
 *         description: Credenciales del usuario
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - user_password
 *           properties:
 *             email:
 *               type: string
 *               example: ejemplo@correo.com
 *             user_password:
 *               type: string
 *               example: contrasena123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', loginController);

export default router;
