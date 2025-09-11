// routes/products.routes.js
import express from 'express';
import multer from 'multer';

import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProducts
} from '../controllers/products.controller.js';

import {
  createProductsBulk,
  validateProductsBulk
} from '../controllers/products.bulk.controller.js';

import { handleMulterError } from '../middlewares/validateData.middleware.js';
import { optimizeImage } from '../middlewares/image.middleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = express.Router();

// Parse JSON bodies for routes that expect JSON
router.use(express.json());

/**
 * RUTAS INDIVIDUALES
 */

// Crear producto (multipart/form-data, con posible foto)
router.post(
  '/api/createproduct',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  createProduct
);

// Obtener todos los productos
router.get('/api/products', getProducts);

// Obtener producto por ID
router.get('/api/getproduct/:id', getProductById);

// Actualizar producto por ID (multipart/form-data si se envía foto)
router.put(
  '/api/updateproduct/:id',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  updateProducts
);

// Actualizar múltiples productos (PUT - cuerpo JSON o array)
router.put('/api/updatemultipleproducts', updateProducts);

// Eliminar producto
router.delete('/api/deleteproduct/:id', deleteProduct);

/**
 * RUTAS DE CARGA MASIVA (desde frontend)
 *
 * - POST /api/products/bulk/validate  => valida los productos (no persiste)
 * - POST /api/products/bulk           => crea/actualiza masivamente
 *
 * Ambas rutas aceptan:
 *  - form-data con campo 'file' (archivo Excel) OR
 *  - JSON body { products: [...] }
 *
 * Si envías archivo, multer lo pondrá en req.file (buffer) y el controlador lo parseará.
 */

// Validación (no persiste) - acepta file upload
router.post(
  '/api/products/bulk/validate',
  upload.single('file'),       // <-- multer: espera campo 'file'
  handleMulterError,          // captura errores de multer (p. ej. tamaño)
  validateProductsBulk
);

// Crear / actualizar masivo - acepta file upload
router.post(
  '/api/products/bulk',
  upload.single('file'),       // <-- multer: espera campo 'file'
  handleMulterError,
  createProductsBulk
);

export default router;
