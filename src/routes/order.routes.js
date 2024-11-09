import { Router } from 'express';
import {
  getOrders,
  getOrdersById,
  createOrders,
  updateOrders,
  deleteOrders,
  getOrdersPending,
  getOrdersPendingById,
  getOrdersDelivered,
  getOrdersDeliveredById
} from '../controllers/orders.controller.js';

const router = Router();

// Rutas para pedidos generales
router.get('/api/orders', getOrders);                
router.get('/api/orders/:id', getOrdersById);       
router.post('/api/orders', createOrders);          
router.put('/api/orders', updateOrders);             
router.delete('/api/orders/:id', deleteOrders);      

// Rutas para pedidos pendientes
router.get('/api/orders/pending', getOrdersPending);             
router.get('/api/orders/pending/:id', getOrdersPendingById);     

// Rutas para pedidos entregados
router.get('/api/orders/delivered', getOrdersDelivered);               
router.get('/api/orders/delivered/:id', getOrdersDeliveredById);      

export default router;