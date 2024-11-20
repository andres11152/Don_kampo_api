import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadImage = async (buffer, fileName) => {
  try {
    // Detectar el tipo MIME del archivo
    const mimeType = lookup(fileName) || 'application/octet-stream';

    // Generar un nombre de archivo único
    const uniqueFileName = `${nanoid()}-${fileName}`;

    // Parámetros de carga para S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${uniqueFileName}`,
      Body: buffer,
      ContentType: mimeType,
    };

    // Subir la imagen a S3
    const data = await s3Client.send(new PutObjectCommand(uploadParams));

    // Verificar si la carga fue exitosa
    console.log('Imagen subida exitosamente:', data);

    // Retornar la URL pública de la imagen
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error('Error al subir la imagen a S3:', error);
    throw new Error(`Error al subir la imagen a S3: ${error.message}`);
  }
};
