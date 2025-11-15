// routes/products.routes.js
import express from 'express';
import multer from 'multer';

import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProducts,
  createProductsBulk,
  validateProductsBulk
} from '../controllers/products.controller.js';

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

// --- RUTAS CRUD PARA PRODUCTOS INDIVIDUALES ---
// Se sigue una convención RESTful. La subida de imágenes se maneja con una cadena
// de middlewares (multer -> error handler -> image optimizer) para mantener los
// controladores limpios y enfocados en la lógica de negocio.

// POST /api/products - Crear un nuevo producto.
// Acepta `multipart/form-data` para poder incluir una imagen.
router.post('/products',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  createProduct
);

// GET /api/products - Obtener todos los productos.
router.get('/products', getProducts);

// GET /api/products/:id - Obtener un producto por su ID.
router.get('/products/:id', getProductById);

// PUT /api/products/:id - Actualizar un producto existente.
// También acepta `multipart/form-data` para permitir la actualización de la imagen.
router.put('/products/:id',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  updateProducts
);

// DELETE /api/products/:id - Eliminar un producto por su ID.
router.delete('/products/:id', deleteProduct);

// --- RUTAS DE CARGA Y VALIDACIÓN MASIVA ---
// Estos endpoints están diseñados para la gestión de productos en lote desde el panel de administración.
// Se optó por rutas de acción específicas (/bulk/validate y /bulk) porque la lógica
// es compleja (parseo de archivos, validación de datos, etc.) y no se ajusta a un CRUD simple.
//
// Ambas rutas aceptan dos formatos para máxima flexibilidad:
// 1. `multipart/form-data` con un campo 'file': Para subir un archivo Excel (.xlsx).
//    Multer procesa el archivo y lo deja en `req.file` para que el controlador lo lea.
// 2. `application/json` con un body `{ "products": [...] }`: Para enviar los datos directamente.

// POST /api/products/bulk/validate - Valida un lote de productos sin guardarlos.
// Su propósito es dar feedback al usuario sobre la calidad de los datos antes de la importación final.
router.post(
  '/products/bulk/validate',
  upload.single('file'),
  handleMulterError,
  validateProductsBulk
);

// POST /api/products/bulk - Crea o actualiza productos en lote.
// Este es el endpoint que persiste los cambios en la base de datos.
router.post(
  '/products/bulk',
  upload.single('file'),
  handleMulterError,
  createProductsBulk
);

// DEPRECATED: Rutas antiguas que serán eliminadas. Se mantienen por retrocompatibilidad.
router.post('/createproduct', upload.single('photo_url'), handleMulterError, optimizeImage, createProduct);
router.get('/getproduct/:id', getProductById);
router.put('/updateproduct/:id', upload.single('photo_url'), handleMulterError, optimizeImage, updateProducts);
router.put('/updatemultipleproducts', updateProducts); // Esta podría ser una ruta /products (PUT) sin ID para bulk update con JSON
router.delete('/deleteproduct/:id', deleteProduct);

export default router;
