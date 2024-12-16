import express from 'express';
import multer from 'multer';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateMultipleProducts } from '../controllers/products.controller.js';
import { handleMulterError, parseMultipartData } from '../middlewares/validateData.js';
import { optimizeImage } from '../middlewares/imageMiddleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

const router = express.Router();

router.use(express.json());  

// Rutas
router.post('/api/createproduct', upload.single('photo_url'), handleMulterError, optimizeImage, parseMultipartData, createProduct);
router.get('/api/products', getProducts); 
router.get('/api/getproduct/:id', getProductById);  
router.put('/api/updateproduct/:id', handleMulterError, updateProduct);
router.put('/api/updatemultipleproducts', updateMultipleProducts);
router.delete('/api/deleteproduct/:id', deleteProduct);

export default router;
