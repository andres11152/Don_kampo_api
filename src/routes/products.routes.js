import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import { getPriceList } from '../controllers/price.controller.js';

const router = express.Router();

router.get('/api/products', getProducts);
router.get('/api/getproduct/:product_id', getProductById);
router.post('/api/createproduct', createProduct);
router.put('/api/updateproduct/:product_id', updateProduct);
router.delete('/api/deleteproduct/:product_id', deleteProduct);

// Endpoint para obtener la lista de precios según el tipo de usuario
router.get('/products/prices/', getPriceList); // Agrega la ruta de precios aquí

export default router;
