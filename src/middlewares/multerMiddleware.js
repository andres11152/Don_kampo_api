import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadSingleImage = upload.single('photo_url');

export const uploadMultipleImages = upload.array('photos');
