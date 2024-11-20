import express from 'express';
import {createShippingInfo,getShippingInfo,getShippingInfoById, updateShippingInfo, deleteShippingInfo,} 
from '../controllers/shipping.controller.js';

const router = express.Router();

router.post('/api/createshipping', createShippingInfo);
router.get('/api/shipping', getShippingInfo);
router.get('/api/getshipping/:id', getShippingInfoById);
router.put('/api/updateshipping/:id', updateShippingInfo);
router.delete('/api/deleteshipping/:id', deleteShippingInfo); 

export default router;
