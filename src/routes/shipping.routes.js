import express from 'express';
import {
  createShippingInfo,
  getShippingInfo,
  getShippingInfoById,
  updateShippingInfo,
  deleteShippingInfo
} from '../controllers/shipping.controller.js';

// Define las rutas para gestionar la información de envío (Shipping) de las órdenes.
// Se sigue una convención RESTful estricta para las operaciones CRUD.
// El objetivo es abstraer la lógica de envío en su propio recurso, permitiendo
// que sea gestionado de forma independiente a la orden principal.
const router = express.Router();

/**
 * @swagger
 * /api/shipping:
 *   post:
 *     tags:
 *       - Envíos
 *     summary: Crear información de envío
 *     parameters:
 *       - in: body
 *         name: shipping
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             shipping_method:
 *               type: string
 *             tracking_number:
 *               type: string
 *             estimated_delivery:
 *               type: string
 *             actual_delivery:
 *               type: string
 *             shipping_status_id:
 *               type: string
 *             order_id:
 *               type: string
 *     responses:
 *       201:
 *         description: Envío creado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/shipping', createShippingInfo);

/**
 * @swagger
 * /api/shipping:
 *   get:
 *     tags:
 *       - Envíos
 *     summary: Obtener todos los envíos
 *     responses:
 *       200:
 *         description: Lista de envíos
 *       500:
 *         description: Error interno
 */
router.get('/shipping', getShippingInfo);

/**
 * @swagger
 * /api/shipping/{id}:
 *   get:
 *     tags:
 *       - Envíos
 *     summary: Obtener información de envío por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Información del envío
 *       404:
 *         description: Envío no encontrado
 *       500:
 *         description: Error interno
 */
router.get('/shipping/:id', getShippingInfoById);

/**
 * @swagger
 * /api/shipping/{id}:
 *   put:
 *     tags:
 *       - Envíos
 *     summary: Actualizar información de envío por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - in: body
 *         name: shipping
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             shipping_method:
 *               type: string
 *             tracking_number:
 *               type: string
 *             estimated_delivery:
 *               type: string
 *             actual_delivery:
 *               type: string
 *             shipping_status_id:
 *               type: string
 *     responses:
 *       200:
 *         description: Información actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/shipping/:id', updateShippingInfo);

/**
 * @swagger
 * /api/shipping/{id}:
 *   delete:
 *     tags:
 *       - Envíos
 *     summary: Eliminar información de envío por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Eliminado exitosamente
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/shipping/:id', deleteShippingInfo);

// DEPRECATED: Rutas antiguas que serán eliminadas. Se mantienen por retrocompatibilidad.
router.post('/createshipping', createShippingInfo);
router.get('/getshipping/:id', getShippingInfoById);
router.put('/updateshipping/:id', updateShippingInfo);
router.delete('/deleteshipping/:id', deleteShippingInfo);


export default router;
