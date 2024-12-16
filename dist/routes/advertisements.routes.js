import express from 'express';
import { getAdvertisements, createAdvertisement, updateAdvertisement, updatePhotos } from '../controllers/advertisements.controller.js';
import { handleMulterError, parseMultipartData } from '../middlewares/validateData.js';
import { optimizeImage } from '../middlewares/imageMiddleware.js';

// Rutas de publicidad
const router = express.Router();

// Middleware para manejar múltiples "imágenes" simuladas como texto
const uploadMultipleImages = (req, res, next) => {
  const {
    photos
  } = req.body;
  if (!photos || !Array.isArray(photos)) {
    return res.status(400).json({
      message: 'Debe proporcionar un arreglo de fotos.'
    });
  }

  // Simular proceso de subida
  req.files = photos.map((photo, index) => ({
    originalname: `photo_${index}`,
    buffer: Buffer.from(photo, 'base64')
  }));
  next();
};
router.get('/api/publicidad', getAdvertisements);
router.post('/api/publicidad', uploadMultipleImages, handleMulterError, optimizeImage, parseMultipartData, createAdvertisement);
router.put('/api/publicidad/categoria/:id', updateAdvertisement);
router.put('/api/publicidad/categoria/photo/:id', uploadMultipleImages, handleMulterError, optimizeImage, parseMultipartData, updatePhotos);
export default router;