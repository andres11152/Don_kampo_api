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

// Este archivo define las rutas para la gestión de órdenes.
// Se sigue una convención RESTful para las operaciones CRUD básicas (GET, POST, PUT, DELETE).
// Además, se exponen rutas de "acción" específicas (ej. /placeOrder, /updatePrices)
// para encapsular lógicas de negocio complejas que no encajan en un CRUD simple,
// como el procesamiento de un carrito de compras o la actualización masiva de precios.
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
// Ruta de acción para procesar un carrito de compras y convertirlo en una orden formal.
// Se utiliza un endpoint específico en lugar de un POST genérico a /api/orders
// porque la lógica de negocio (validar stock, calcular totales, crear registros asociados)
// es significativamente más compleja que una simple creación de registro.
router.post('/orders/placeOrder', placeOrder);

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
router.get('/orders', getOrders);

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
router.get('/orders/:orderId', getOrdersById);

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
// Endpoint principal y estandarizado para la actualización de órdenes.
// Centraliza la lógica de modificación de ítems, datos de envío y metadatos,
// recalculando totales para mantener la consistencia.
router.put('/orders/:orderId', updateOrderById); // <-- endpoint agregado

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
// DEPRECATED: Esta ruta fue reemplazada por `POST /api/orders` que debería usarse en su lugar.
// Se mantiene temporalmente por retrocompatibilidad con versiones anteriores del panel de administración.
router.post('/createorders', createOrders);

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
// DEPRECATED: Esta ruta fue reemplazada por `PUT /api/orders/:orderId`.
// Se mantiene temporalmente por retrocompatibilidad.
router.put('/updateorders/:orderId', updateOrders);

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
// Ruta de acción para recalcular los precios de todas las órdenes pendientes.
// Es un proceso batch diseñado para ser ejecutado manualmente o de forma programada
// cuando hay cambios en la lista de precios de los productos.
router.put('/orders/updatePrices', updateOrderPrices);

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
// DEPRECATED: Esta ruta fue reemplazada por `DELETE /api/orders/:orderId`.
// Se mantiene temporalmente por retrocompatibilidad.
router.delete('/orders/:orderId', deleteOrders);

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
// Ruta de acción para una actualización rápida y específica del estado de una orden.
// Se utiliza en flujos de trabajo donde solo se necesita cambiar el estado (ej. "enviado", "entregado")
// sin modificar el resto de la orden, optimizando la operación.
router.put('/orders/:id/status/:status_id', updateOrderStatus);

/**
 * @swagger
 * /api/orders/bulk-update-status:
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
// Ruta de acción para la actualización masiva de estados de órdenes.
// Permite al administrador seleccionar múltiples órdenes y aplicar un cambio de estado
// en una sola operación, mejorando la eficiencia de la gestión.
router.put('/orders/bulk-update-status', updateBulkOrders);

// DEPRECATED: Rutas antiguas que serán eliminadas. Se mantienen por retrocompatibilidad.
router.put('/updatestatus/:id/:status_id', updateOrderStatus);
router.put('/update-bulk-orders', updateBulkOrders);

export default router;
