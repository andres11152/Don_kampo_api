import { Router } from 'express';
import { placeOrder, getOrders, getOrdersById, createOrders, updateOrders, deleteOrders, updateOrderStatus } from '../controllers/orders.controller.js';

const router = Router();

router.post('/api/orders/placeOrder', placeOrder);
router.get('/api/orders', getOrders);
router.get('/api/orders/:orderId', getOrdersById);
router.post('/api/createorders', createOrders);
router.put('/api/updateorders/:orderId', updateOrders);
router.delete('/api/deleteorders/:orderId', deleteOrders);
router.put('/api/updatestatus/:id/:status_id', updateOrderStatus);

export default router;