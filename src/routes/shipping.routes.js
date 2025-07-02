import express from 'express';
import {
  createShippingInfo,
  getShippingInfo,
  getShippingInfoById,
  updateShippingInfo,
  deleteShippingInfo
} from '../controllers/shipping.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/createshipping:
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
router.post('/api/createshipping', createShippingInfo);

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
router.get('/api/shipping', getShippingInfo);

/**
 * @swagger
 * /api/getshipping/{id}:
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
router.get('/api/getshipping/:id', getShippingInfoById);

/**
 * @swagger
 * /api/updateshipping/{id}:
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
router.put('/api/updateshipping/:id', updateShippingInfo);

/**
 * @swagger
 * /api/deleteshipping/{id}:
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
router.delete('/api/deleteshipping/:id', deleteShippingInfo);

export default router;
