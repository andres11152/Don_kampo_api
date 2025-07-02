import { Router } from 'express';
import {
  getUsers,
  getUsersById,
  createUsers,
  updateUsers,
  updateUserStatus,
  deleteUsers,
} from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  requestPasswordReset,
  verifyCodeAndResetPassword,
} from '../controllers/resetPassword.controller.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener todos los usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error interno del servidor
 */
router.get('/api/users', getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener un usuario por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.get('/api/users/:id', getUsersById);

/**
 * @swagger
 * /api/createusers:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear un nuevo usuario
 *     parameters:
 *       - in: body
 *         name: user
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_name:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             city:
 *               type: string
 *             address:
 *               type: string
 *             neighborhood:
 *               type: string
 *             user_password:
 *               type: string
 *             user_type:
 *               type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/api/createusers', createUsers);

/**
 * @swagger
 * /api/updateusers/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar usuario por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - in: body
 *         name: user
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_name:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             city:
 *               type: string
 *             address:
 *               type: string
 *             neighborhood:
 *               type: string
 *             user_password:
 *               type: string
 *             user_type:
 *               type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/api/updateusers/:id', updateUsers);

/**
 * @swagger
 * /api/deleteusers/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/api/deleteusers/:id', deleteUsers);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Perfil
 *     summary: Obtener perfil del usuario autenticado
 *     parameters:
 *       - name: authorization
 *         in: header
 *         type: string
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error del servidor
 */
router.get('/api/profile', verifyToken, getUserProfile);

/**
 * @swagger
 * /api/userstatus/{id}/{status_id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar estado de usuario
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - name: status_id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.put('/api/userstatus/:id/:status_id', updateUserStatus);

/**
 * @swagger
 * /api/request-password-reset:
 *   post:
 *     tags:
 *       - Recuperación de contraseña
 *     summary: Solicitar restablecimiento de contraseña
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             provider:
 *               type: string
 *     responses:
 *       200:
 *         description: Solicitud enviada
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/api/request-password-reset', requestPasswordReset);

/**
 * @swagger
 * /api/verify-code-and-reset-password:
 *   post:
 *     tags:
 *       - Recuperación de contraseña
 *     summary: Verificar código y restablecer contraseña
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             code:
 *               type: string
 *             newPassword:
 *               type: string
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Código inválido
 *       500:
 *         description: Error del servidor
 */
router.post('/api/verify-code-and-reset-password', verifyCodeAndResetPassword);

export default router;
