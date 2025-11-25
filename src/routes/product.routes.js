import { Router } from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { createProduct } from '../controllers/product.controller.js';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear un nuevo producto con imagen
 *     description: Crea un producto, incluyendo variaciones y una imagen que se sube a S3.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: photo
 *         type: file
 *         description: La imagen del producto.
 *       - in: formData
 *         name: name
 *         type: string
 *       # ... (se pueden añadir más parámetros para Swagger si se desea)
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
// Esta es la ruta RESTful correcta para crear un producto.
// Usa el middleware 'upload' para procesar la imagen antes de pasar al controlador.
router.post('/products', [verifyToken, isAdmin, upload.single('photo')], createProduct);

export default router;