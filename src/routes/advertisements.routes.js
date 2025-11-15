import express from 'express';
import multer from 'multer';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
} from '../controllers/advertisements.controller.js';
import { handleMulterError } from '../middlewares/validateData.middleware.js';
import { optimizeImage } from '../middlewares/image.middleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();
router.use(express.json());

/**
 * @swagger
 * /api/advertisements:
 *   get:
 *     summary: Obtener todas las publicidades
 *     tags: [Publicidad]
 *     responses:
 *       200:
 *         description: Lista de publicidades
 *       500:
 *         description: Error del servidor
 */
router.get('/advertisements', getAdvertisements);

/**
 * @swagger
 * /api/advertisements:
 *   post:
 *     summary: Crear una nueva publicidad
 *     tags: [Publicidad]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nueva Promo
 *               description:
 *                 type: string
 *                 example: Descuento por temporada
 *               category:
 *                 type: string
 *                 example: Hogar
 *               related_product_id:
 *                 type: string
 *                 example: 654321
 *               photo_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Publicidad creada
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */

// Cadena de middlewares para el manejo de imágenes en las rutas de creación y actualización.
// El flujo es el siguiente:
// 1. `upload.single('photo_url')`: Multer procesa la petición `multipart/form-data`. Si hay un archivo, lo carga en memoria (`req.file`).
// 2. `handleMulterError`: Middleware personalizado que intercepta errores de Multer (p. ej., archivo demasiado grande) y devuelve una respuesta 400 estandarizada.
// 3. `optimizeImage`: Procesa la imagen (comprime, convierte a WebP), la sube a un almacenamiento en la nube y adjunta la URL pública al `req` para que el controlador la persista.
// Este enfoque separa responsabilidades, mantiene los controladores limpios y centraliza la lógica de manipulación de archivos.
router.post('/advertisements',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  createAdvertisement
);

/**
 * @swagger
 * /api/advertisements/{id}:
 *   put:
 *     summary: Actualizar una publicidad existente
 *     tags: [Publicidad]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               related_product_id:
 *                 type: string
 *               photo_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Publicidad actualizada
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/advertisements/:id',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  updateAdvertisement
);

/**
 * @swagger
 * /api/advertisements/{id}:
 *   delete:
 *     summary: Eliminar una publicidad
 *     tags: [Publicidad]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Publicidad eliminada
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/advertisements/:id', deleteAdvertisement);

export default router;
