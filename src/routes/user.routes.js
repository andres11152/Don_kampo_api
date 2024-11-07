import { Router } from 'express';
import { getUsers, getUsersById, createUsers, updateUsers, deleteUsers } from '../controllers/users.controller.js';
import { getUserProfile } from '../controllers/profile.controller.js'; // Asegúrate de tener un controlador para obtener el perfil
import { verifyToken } from '../middlewares/auth.middleware.js'; // Importa el middleware
import { getPriceList } from '../controllers/price.controller.js';

const router = Router();

router.get('/api/users', getUsers); // Nuevo endpoint para obtener todos los usuarios
router.get('/api/users/:id', getUsersById);  // Nuevo endpoint para obtener un usuario por ID
router.post('/api/createusers', createUsers); // Nuevo endpoint para crear un usuario
router.put('/api/updateusers/:id', updateUsers); // Nuevo endpoint para actualizar un usuario
router.delete('/api/deleteusers/:id', deleteUsers); // Nuevo endpoint para eliminar un usuario


// Nuevo endpoint para obtener el perfil del usuario
router.get('/api/profile', verifyToken, getUserProfile);

// Ruta para obtener la lista de precios según el tipo de cliente
router.get('/api/prices/user_type', getPriceList);


export default router;
