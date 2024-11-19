// /middlewares/multerMiddleware.js
import multer from 'multer';

// Configuración de Multer para usar almacenamiento en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Middleware para manejar la carga de una sola imagen
export const uploadSingleImage = upload.single('photo_url');
