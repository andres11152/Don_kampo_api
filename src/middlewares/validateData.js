import multer from 'multer';

// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('photo');  // 'photo' es el nombre del campo del archivo

// Middleware para manejar errores de Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Error en la carga del archivo: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
  next();
};
