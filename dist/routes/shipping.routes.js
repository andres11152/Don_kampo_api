import express from 'express';
import { createShippingInfo, getShippingInfo, getShippingInfoById, updateShippingInfo, deleteShippingInfo } from '../controllers/shipping.controller.js';
const router = express.Router();
router.post('/api/createshipping', createShippingInfo); // Ruta para crear nueva información de envío
router.get('/api/shipping', getShippingInfo); // Ruta para obtener toda la información de envíos
router.get('/api/getshipping/:id', getShippingInfoById); // Ruta para obtener información de envío por ID
router.put('/api/updateshipping/:id', updateShippingInfo); // Ruta para actualizar información de envío
router.delete('/api/deleteshipping/:id', deleteShippingInfo); // Ruta para eliminar información de envío

export default router;