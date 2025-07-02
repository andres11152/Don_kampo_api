import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProducts
} from '../controllers/products.controller.js';
import { handleMulterError } from '../middlewares/validateData.middleware.js';
import { optimizeImage } from '../middlewares/image.middleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.use(express.json());

/**
 * @swagger
 * /api/createproduct:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear nuevo producto
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *       - in: formData
 *         name: description
 *         type: string
 *       - in: formData
 *         name: category
 *         type: string
 *       - in: formData
 *         name: variations
 *         type: string
 *       - in: formData
 *         name: active
 *         type: boolean
 *       - in: formData
 *         name: promocionar
 *         type: boolean
 *       - in: formData
 *         name: photo_url
 *         type: file
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
router.post(
  '/api/createproduct',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener todos los productos
 *     responses:
 *       200:
 *         description: Lista de productos
 *       500:
 *         description: Error interno
 */
router.get('/api/products', getProducts);

/**
 * @swagger
 * /api/getproduct/{id}:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener producto por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Detalles del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/api/getproduct/:id', getProductById);

/**
 * @swagger
 * /api/updateproduct/{id}:
 *   put:
 *     tags:
 *       - Productos
 *     summary: Actualizar producto por ID
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         type: string
 *       - in: formData
 *         name: description
 *         type: string
 *       - in: formData
 *         name: category
 *         type: string
 *       - in: formData
 *         name: variations
 *         type: string
 *       - in: formData
 *         name: active
 *         type: boolean
 *       - in: formData
 *         name: promocionar
 *         type: boolean
 *       - in: formData
 *         name: photo_url
 *         type: file
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Error de datos
 *       404:
 *         description: No encontrado
 */
router.put(
  '/api/updateproduct/:id',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  updateProducts
);

/**
 * @swagger
 * /api/updatemultipleproducts:
 *   put:
 *     tags:
 *       - Productos
 *     summary: Actualizar múltiples productos
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           example:
 *             products: []
 *     responses:
 *       200:
 *         description: Productos actualizados
 *       400:
 *         description: Datos inválidos
 */
router.put('/api/updatemultipleproducts', updateProducts);

/**
 * @swagger
 * /api/deleteproduct/{id}:
 *   delete:
 *     tags:
 *       - Productos
 *     summary: Eliminar producto por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/api/deleteproduct/:id', deleteProduct);

export default router;
