import { Router } from 'express';
import {
  getMinimumOrders,
  createOrUpdateMinimumOrder,
  deleteMinimumOrder,
} from '../controllers/minimumOrder.controller.js';

const router = Router();

/**
 * @swagger
 * /api/minimum-orders:
 *   get:
 *     tags:
 *       - Pedidos Mínimos
 *     summary: Obtener todos los pedidos mínimos
 *     description: Retorna todos los registros de pedidos mínimos configurados.
 *     responses:
 *       200:
 *         description: Lista obtenida correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/api/minimum-orders', getMinimumOrders);

/**
 * @swagger
 * /api/minimum-orders:
 *   post:
 *     tags:
 *       - Pedidos Mínimos
 *     summary: Crear o actualizar pedido mínimo
 *     description: Crea o actualiza el valor mínimo de pedido para un tipo de cliente.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: datos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             customer_type:
 *               type: string
 *               example: hogar
 *             minimum_order:
 *               type: number
 *               example: 30000
 *     responses:
 *       200:
 *         description: Pedido mínimo actualizado o creado
 *       400:
 *         description: Datos incorrectos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/api/minimum-orders', createOrUpdateMinimumOrder);

/**
 * @swagger
 * /api/minimum-orders/{id}:
 *   delete:
 *     tags:
 *       - Pedidos Mínimos
 *     summary: Eliminar un pedido mínimo
 *     description: Elimina un pedido mínimo específico usando su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/api/minimum-orders/:id', deleteMinimumOrder);

export default router;
