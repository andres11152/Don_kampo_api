import multer from 'multer';

const validateProductData = (req, res, next) => {
    const { name, description, category, stock } = req.body;
  
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Campos obligatorios: name, description, category' });
    }
  
    if (stock && isNaN(stock)) {
      return res.status(400).json({ message: 'El stock debe ser un número válido' });
    }
  
    next();
  };

  // Configuración de multer para manejar archivos en memoria
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  
  // Middleware para manejar errores de multer
  export const handleMulterError = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Error al procesar el archivo' });
      } else if (err) {
        return res.status(500).json({ message: 'Error interno al procesar la solicitud' });
      }
      next();
    });
  };
  