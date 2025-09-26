import { Router } from 'express';
import {
  placeOrder,
  getOrders,
  getOrdersById,
  createOrders,
  updateOrders,
  updateOrderById,        // <-- importado
  deleteOrders,
  updateOrderStatus,
  updateOrderPrices,
  updateBulkOrders
} from '../controllers/orders.controller.js';

const router = Router();

/**
 * @swagger
 * /api/orders/placeOrder:
 *   post:
 *     tags:
 *       - Órdenes
 *     summary: Realizar una orden
 *     description: Procesa una nueva orden desde el carrito.
 *     parameters:
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             cartDetails:
 *               type: array
 *               items:
 *                 type: object
 *             shippingMethod:
 *               type: string
 *             estimatedDelivery:
 *               type: string
 *             actualDelivery:
 *               type: string
 *             total:
 *               type: number
 *             userData:
 *               type: object
 *             companyName:
 *               type: string
 *             companyNit:
 *               type: string
 *     responses:
 *       201:
 *         description: Orden creada
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
router.post('/api/orders/placeOrder', placeOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Órdenes
 *     summary: Obtener todas las órdenes
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *       500:
 *         description: Error interno
 */
router.get('/api/orders', getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags:
 *       - Órdenes
 *     summary: Obtener orden por ID
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Detalles de la orden
 *       404:
 *         description: Orden no encontrada
 */
router.get('/api/orders/:orderId', getOrdersById);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   put:
 *     tags:
 *       - Órdenes
 *     summary: Actualizar una orden específica (metadatos, items, shipping, userData)
 *     description: Actualiza metadatos de la orden, permite upsert/eliminar ítems, actualizar user_data y shipping. Recalcula total.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         type: string
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status_id:
 *               type: string
 *             requires_electronic_billing:
 *               type: boolean
 *             company_name:
 *               type: string
 *             nit:
 *               type: string
 *             user_type:
 *               type: string
 *             shipping:
 *               type: object
 *             userData:
 *               type: object
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *             itemsToRemove:
 *               type: array
 *               items:
 *                 type: object
 *             shipping_cost:
 *               type: number
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno
 */
router.put('/api/orders/:orderId', updateOrderById); // <-- endpoint agregado

/**
 * @swagger
 * /api/createorders:
 *   post:
 *     tags:
 *       - Órdenes
 *     summary: Crear orden (modo extendido)
 *     parameters:
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             customer_id:
 *               type: string
 *             order_date:
 *               type: string
 *             status_id:
 *               type: string
 *             total:
 *               type: number
 *             requires_electronic_billing:
 *               type: boolean
 *             company_name:
 *               type: string
 *             nit:
 *               type: string
 *     responses:
 *       201:
 *         description: Orden creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/api/createorders', createOrders);

/**
 * @swagger
 * /api/updateorders/{orderId}:
 *   put:
 *     tags:
 *       - Órdenes
 *     summary: Actualizar orden (método legacy)
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         type: string
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             customer_id:
 *               type: string
 *             order_date:
 *               type: string
 *             status_id:
 *               type: string
 *             total:
 *               type: number
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       400:
 *         description: Datos inválidos
 */
router.put('/api/updateorders/:orderId', updateOrders);

/**
 * @swagger
 * /api/orders/updatePrices:
 *   put:
 *     tags:
 *       - Órdenes
 *     summary: Actualizar precios de órdenes pendientes
 *     responses:
 *       200:
 *         description: Precios actualizados
 *       500:
 *         description: Error interno
 */
router.put('/api/orders/updatePrices', updateOrderPrices);

/**
 * @swagger
 * /api/deleteorders/{orderId}:
 *   delete:
 *     tags:
 *       - Órdenes
 *     summary: Eliminar una orden
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Orden eliminada
 *       404:
 *         description: No encontrada
 */
router.delete('/api/deleteorders/:orderId', deleteOrders);

/**
 * @swagger
 * /api/updatestatus/{id}/{status_id}:
 *   put:
 *     tags:
 *       - Órdenes
 *     summary: Cambiar estado de una orden
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
 */
router.put('/api/updatestatus/:id/:status_id', updateOrderStatus);

/**
 * @swagger
 * /api/update-bulk-orders:
 *   put:
 *     tags:
 *       - Órdenes
 *     summary: Actualizar múltiples órdenes
 *     parameters:
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             orderIds:
 *               type: array
 *               items:
 *                 type: string
 *             newStatus:
 *               type: string
 *     responses:
 *       200:
 *         description: Órdenes actualizadas
 *       400:
 *         description: Datos inválidos
 */
router.put('/api/update-bulk-orders', updateBulkOrders);

export default router;
