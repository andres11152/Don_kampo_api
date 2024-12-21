import sharp from 'sharp';

export const optimizeImage = (req, res, next) => {
  if (req.file) {
    
    sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside' })  
      .jpeg({ quality: 80 })  
      .toBuffer((err, buffer) => {
        if (err) {
          return res.status(500).send('Error al optimizar la imagen');
        }
        req.optimizedImage = buffer;  
        next();  
      });
  } else {
    next();
  }
};
