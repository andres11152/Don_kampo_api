import { Router } from 'express';
import { getUsers, getUsersById, createUsers, updateUsers, updateUserStatus, deleteUsers } from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js'; // Asegúrate de tener un controlador para obtener el perfil
import { verifyToken } from '../middlewares/auth.middleware.js'; // Importa el middleware
import { requestPasswordReset, verifyCodeAndResetPassword } from '../controllers/resetPassword.controller.js'; // Importa los controladores para la funcionalidad de restablecimiento de contraseña

const router = Router();
router.get('/api/users', getUsers); // Nuevo endpoint para obtener todos los usuarios
router.get('/api/users/:id', getUsersById); // Nuevo endpoint para obtener un usuario por ID
router.post('/api/createusers', createUsers); // Nuevo endpoint para crear un usuario
router.put('/api/updateusers/:id', updateUsers); // Nuevo endpoint para actualizar un usuario
router.delete('/api/deleteusers/:id', deleteUsers); // Nuevo endpoint para eliminar un usuario

// Rutas para el perfil del usuario
router.get('/api/profile', verifyToken, getUserProfile);

// Rutas para el estado del usuario
router.put('/api/userstatus/:id/:status_id', updateUserStatus);

// Ruta para solicitar el código de restablecimiento
router.post('/api/request-password-reset', requestPasswordReset);

// Ruta para verificar el código y restablecer la contraseña
router.post('/api/verify-code-and-reset-password', verifyCodeAndResetPassword);
export default router;