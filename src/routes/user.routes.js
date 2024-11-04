import { Router } from 'express';
import { getUsers, getUsersById, createUsers, updateUsers, deleteUsers } from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js'; // Asegúrate de tener un controlador para obtener el perfil
import { verifyToken } from '../middlewares/auth.middleware.js'; // Importa el middleware

const router = Router();

router.get('/users', getUsers);
router.get('/api/users/', getUsersById);
router.post('/api/createusers', createUsers);
router.put('/api/users/', updateUsers); // Agregué la barra inicial faltante
router.delete('/api/deleteusers/:id', deleteUsers);

// Nuevo endpoint para obtener el perfil del usuario
router.get('/api/profile', verifyToken, getUserProfile);

export default router;
