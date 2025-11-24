import { Router } from 'express';
import {
  getUsers,
  getUsersById,
  createUsers,
  updateUsers,
  updateUserStatus,
  deleteUsers,
  changePassword, // Importar el nuevo controlador
} from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  requestPasswordReset,
  verifyCodeAndResetPassword,
} from '../controllers/resetPassword.controller.js';

// Define las rutas para la gestión de usuarios y perfil.
// Se utiliza una convención RESTful para el CRUD de usuarios.
// Adicionalmente, se exponen rutas de acción para funcionalidades específicas como:
// - `/api/profile`: Obtener los datos del usuario autenticado (protegida).
// - `/api/request-password-reset`: Iniciar el flujo de recuperación de contraseña.
// - `/api/verify-code-and-reset-password`: Completar la recuperación de contraseña.
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
router.get('/users', getUsers);

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
router.get('/users/:id', getUsersById);

/**
 * @swagger
 * /api/users:
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
router.post('/users', createUsers);

/**
 * @swagger
 * /api/users/{id}:
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
router.put('/users/:id', updateUsers);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Cambiar la contraseña del usuario autenticado
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: body
 *         name: passwordInfo
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             currentPassword:
 *               type: string
 *             newPassword:
 *               type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.put('/users/change-password', verifyToken, changePassword);
/**
 * @swagger
 * /api/users/{id}:
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
router.delete('/users/:id', deleteUsers);

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
// Ruta de acción para obtener el perfil del usuario actualmente autenticado.
// Se protege con el middleware `verifyToken` para asegurar que solo el usuario
// logueado pueda acceder a su propia información, extrayendo su ID desde el token JWT.

/**
 * @swagger
 * /api/users/{id}/status/{status_id}:
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
router.put('/users/:id/status/:status_id', updateUserStatus);

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
router.post('/request-password-reset', requestPasswordReset);

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
router.post('/verify-code-and-reset-password', verifyCodeAndResetPassword);

// DEPRECATED: Rutas antiguas que serán eliminadas. Se mantienen por retrocompatibilidad.
router.post('/createusers', createUsers);
router.put('/updateusers/:id', updateUsers);
router.delete('/deleteusers/:id', deleteUsers);
router.put('/userstatus/:id/:status_id', updateUserStatus);


export default router;
