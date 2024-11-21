import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('photo_url');

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Error en la carga del archivo: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
  next();
};

export const parseMultipartData = (req, res, next) => {
  try {
    // Asegúrate de que los campos JSON se analicen correctamente
    if (req.body.variations) {
      req.body.variations = JSON.parse(req.body.variations);
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Error al procesar los datos de variaciones' });
  }
};