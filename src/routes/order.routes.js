import { Router } from 'express';
import {
  getOrders,
  getOrdersById,
  createOrders,
  updateOrders,
  deleteOrders,
  getOrdersPending,
  getOrdersPendingById,
  createOrdersPending,
  updateOrdersPending,
  deleteOrdersPending,
  getOrdersDelivered,
  getOrdersDeliveredById,
  createOrdersDelivered,
  updateOrdersDelivered,
  deleteOrdersDelivered,
  getOrdersShipped,
  getOrdersShippedById,
  createOrdersShipped,
  updateOrdersShipped,
  deleteOrdersShipped,
} from '../controllers/order.controller.js';

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
router.post('/api/orders/pending', createOrdersPending);
router.put('/api/orders/pending', updateOrdersPending);
router.delete('/api/orders/pending/:id', deleteOrdersPending);

// Rutas para pedidos entregados
router.get('/api/orders/delivered', getOrdersDelivered);
router.get('/api/orders/delivered/:id', getOrdersDeliveredById);
router.post('/api/orders/delivered', createOrdersDelivered);
router.put('/api/orders/delivered', updateOrdersDelivered);
router.delete('/api/orders/delivered/:id', deleteOrdersDelivered);

// Rutas para pedidos enviados
router.get('/api/orders/shipped', getOrdersShipped);
router.get('/api/orders/shipped/:id', getOrdersShippedById);
router.post('/api/orders/shipped', createOrdersShipped);
router.put('/api/orders/shipped', updateOrdersShipped);
router.delete('/api/orders/shipped/:id', deleteOrdersShipped);

export default router;