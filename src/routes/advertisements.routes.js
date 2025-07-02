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
 * /api/publicidad:
 *   get:
 *     summary: Obtener todas las publicidades
 *     tags: [Publicidad]
 *     responses:
 *       200:
 *         description: Lista de publicidades
 *       500:
 *         description: Error del servidor
 */
router.get('/api/publicidad', getAdvertisements);

/**
 * @swagger
 * /api/publicidad:
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
router.post('/api/publicidad',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  createAdvertisement
);

/**
 * @swagger
 * /api/publicidad/{id}:
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
router.put('/api/publicidad/:id',
  upload.single('photo_url'),
  handleMulterError,
  optimizeImage,
  updateAdvertisement
);

/**
 * @swagger
 * /api/publicidad/{id}:
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
router.delete('/api/publicidad/:id', deleteAdvertisement);

export default router;
