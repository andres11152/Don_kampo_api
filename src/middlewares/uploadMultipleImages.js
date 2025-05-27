// Middleware para manejar múltiples imágenes en formato Base64
export const uploadMultipleImages = (req, res, next) => {
    const { photos } = req.body;
  
    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ message: 'Debe proporcionar un arreglo de fotos.' });
    }
  
    try {
      req.files = photos.map((photo, index) => {
        if (!photo || typeof photo !== 'string') {
          throw new Error(`La imagen en la posición ${index} no es válida.`);
        }
        return {
          originalname: `photo_${index}.png`,
          buffer: Buffer.from(photo, 'base64'),
        };
      });
      next();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
  