import { Router } from 'express';       
import { getUsers, getUsersById, createUsers, updateUsers, deleteUsers } from '../controllers/users.controller.js';

const router = Router();

router.get('/api/users', getUsers);
router.get('/api/users/:id', getUsersById);
router.post('/api/createusers', createUsers);
router.put('api/users/:id', updateUsers);
router.delete('/api/:id', deleteUsers);

export default router;




