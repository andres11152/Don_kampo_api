// /routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import { handleMulterError } from '../middlewares/validateData.js';
import { optimizeImage } from '../middlewares/imageMiddleware.js';

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage(); // Usamos almacenamiento en memoria
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño del archivo (5MB)
});

const router = express.Router();

// Ruta para crear un nuevo producto con la subida de imagen
router.post('/api/createproduct', upload.single('photo_url'), handleMulterError, optimizeImage, createProduct);

// Otras rutas
router.get('/api/products', getProducts);  // Obtener todos los productos
router.get('/api/getproduct/:id', getProductById);  // Obtener un producto por ID
router.put('/api/updateproduct/:id', handleMulterError, optimizeImage, updateProduct);  // Actualizar producto
router.delete('/api/deleteproduct/:id', deleteProduct);  // Eliminar producto

export default router;
