// Importamos S3Client desde la librería de AWS SDK
import { S3Client } from '@aws-sdk/client-s3';  
import dotenv from 'dotenv';

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Creamos la instancia de S3Client con las credenciales desde las variables de entorno
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,  // Usamos la región desde el archivo .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Clave de acceso desde las variables de entorno
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Clave secreta desde las variables de entorno
  },
});

// Exportamos la instancia creada para usarla en otros archivos
export default s3Client;
