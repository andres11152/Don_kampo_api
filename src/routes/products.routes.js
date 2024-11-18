import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import { handleMulterError } from '../middlewares/validateData.js';

const router = express.Router();

// Rutas
router.get('/api/products', getProducts);
router.get('/api/getproduct/:product_id', getProductById);

// Ruta para crear productos con middleware de manejo de archivos
router.post('/api/createproduct', handleMulterError, createProduct);

// Ruta para actualizar productos con middleware de manejo de archivos
router.put('/api/updateproduct/:product_id', handleMulterError, updateProduct);

router.delete('/api/deleteproduct/:product_id', deleteProduct);

export default router;
