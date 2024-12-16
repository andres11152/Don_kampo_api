import express from 'express';
import multer from 'multer';
import { getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from '../controllers/advertisements.controller.js';
import { handleMulterError } from '../middlewares/validateData.js';
import { optimizeImage } from '../middlewares/imageMiddleware.js';

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  } // Limite de 10MB por archivo
});
const router = express.Router();
router.use(express.json());

// Obtener todas las publicidades
router.get('/api/publicidad', getAdvertisements);

// Crear una nueva publicidad (subiendo una sola foto)
router.post('/api/publicidad', upload.single('photo_url'), handleMulterError, optimizeImage, createAdvertisement);
router.put('/api/publicidad/:id', upload.single('photo_url'), handleMulterError, optimizeImage, updateAdvertisement);
router.delete('/api/publicidad/:id', deleteAdvertisement);
export default router;