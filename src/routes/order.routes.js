import { Router } from 'express';
import { placeOrder, getOrders, getOrdersById, createOrders, updateOrders, deleteOrders } from '../controllers/orders.controller.js';

const router = Router();

// Ruta para colocar un nuevo pedido
router.post('/api/orders/placeOrder', placeOrder);

// Rutas para otros métodos
router.get('/api/orders', getOrders);
router.get('/api/orders/:orderId', getOrdersById);
router.post('/api/createorders', createOrders);
router.put('/api/updateorders/:orderId', updateOrders);
router.delete('/api/deleteorders/:orderId', deleteOrders);

export default router;