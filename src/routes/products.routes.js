import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import multer from 'multer';

const router = express.Router();

// Configurar almacenamiento con multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/api/products', getProducts);
router.get('/api/getproduct/:product_id', getProductById);
router.post('/api/createproduct', upload.single('photo'), createProduct);
router.put('/api/updateproduct/:product_id', updateProduct);
router.delete('/api/deleteproduct/:product_id', deleteProduct);

export default router;
