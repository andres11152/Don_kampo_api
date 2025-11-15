import { Router } from 'express';
import { getCustomerTypes, updateAllShippingCosts } from '../controllers/customerTypes.Controller.js';

// Define las rutas para gestionar las configuraciones asociadas a los tipos de cliente.
// El objetivo es centralizar reglas de negocio que varían según el perfil del cliente,
// como los costos de envío, permitiendo que el frontend las consulte y el backend las administre
// de forma centralizada.
const router = Router();

/**
 * @swagger
 * /api/customer-types:
 *   get:
 *     tags:
 *       - Tipos de Cliente
 *     summary: Obtener todos los tipos de cliente
 *     description: Retorna una lista con todos los tipos de cliente configurados en el sistema.
 *     responses:
 *       200:
 *         description: Lista de tipos de cliente obtenida correctamente
 *       404:
 *         description: No se encontraron tipos de cliente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/customer-types', getCustomerTypes);

/**
 * @swagger
 * /api/customer-types/shipping-costs:
 *   put:
 *     tags:
 *       - Tipos de Cliente
 *     summary: Actualizar costos de envío por tipo de cliente
 *     description: Permite actualizar los costos de envío para cada tipo de cliente (hogar, fruver, supermercado, restaurante).
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: costos
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             hogar:
 *               type: number
 *               example: 8000
 *             fruver:
 *               type: number
 *               example: 12000
 *             supermercado:
 *               type: number
 *               example: 10000
 *             restaurante:
 *               type: number
 *               example: 11000
 *     responses:
 *       200:
 *         description: Costos actualizados correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       500:
 *         description: Error interno del servidor
 */
router.put('/customer-types/shipping-costs', updateAllShippingCosts);

export default router;
