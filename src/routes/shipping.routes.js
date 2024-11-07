import express from 'express';
import {
  createShippingInfo,
  getShippingInfo,
  getShippingInfoById,
  updateShippingInfo,
  deleteShippingInfo,
} from '../controllers/shipping.controller.js';

const router = express.Router();

// Ruta para crear nueva información de envío
router.post('/shipping', createShippingInfo);

// Ruta para obtener toda la información de envíos
router.get('/shipping', getShippingInfo);

// Ruta para obtener información de envío por ID
router.get('/shipping/:id', getShippingInfoById);

// Ruta para actualizar información de envío por ID
router.put('/shipping/:id', updateShippingInfo);

// Ruta para eliminar información de envío por ID
router.delete('/shipping/:id', deleteShippingInfo);

export default router;
