import express from 'express';
import {createShippingInfo,getShippingInfo,getShippingInfoById, updateShippingInfo, deleteShippingInfo,
} from '../controllers/shipping.controller.js';


const router = express.Router();

// Ruta para crear nueva información de envío
router.post('/api/createshipping', createShippingInfo);

// Ruta para obtener toda la información de envíos
router.get('/api/shipping', getShippingInfo);

// Ruta para obtener información de envío por ID
router.get('/api/getshipping/:id', getShippingInfoById);

// Ruta para actualizar información de envío
router.put('/api/updateshipping/:id', updateShippingInfo);

// Ruta para eliminar información de envío
router.delete('/api/deleteshipping/:id', deleteShippingInfo);

export default router;
