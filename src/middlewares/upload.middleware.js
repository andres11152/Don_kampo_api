import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/config.js';

// Configuración del cliente de S3
const s3 = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
});

// Configuración de Multer para subir a S3
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: awsConfig.bucketName,
    acl: 'public-read', // Hace los archivos públicamente legibles
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `products/${Date.now().toString()}-${file.originalname}`);
    },
  }),
});