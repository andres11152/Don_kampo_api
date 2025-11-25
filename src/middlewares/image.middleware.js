import sharp from 'sharp';

export const optimizeImage = (req, res, next) => {
  // Support both single-file (req.file) and fields-style (req.files)
  let fileBuffer = null;

  if (req.file && req.file.buffer) {
    fileBuffer = req.file.buffer;
  } else if (req.files && typeof req.files === 'object') {
    // Check common field names
    const possibleFields = ['photo_url', 'photo', 'file'];
    for (const f of possibleFields) {
      const arr = req.files[f];
      if (Array.isArray(arr) && arr[0] && arr[0].buffer) {
        fileBuffer = arr[0].buffer;
        break;
      }
    }
    // If multer was used with upload.any(), files may be an array at req.files
    if (!fileBuffer && Array.isArray(req.files) && req.files[0] && req.files[0].buffer) {
      fileBuffer = req.files[0].buffer;
    }
  }

  if (!fileBuffer) return next();

  sharp(fileBuffer)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).send('Error al optimizar la imagen');
      }
      req.optimizedImage = buffer;
      next();
    });
};
