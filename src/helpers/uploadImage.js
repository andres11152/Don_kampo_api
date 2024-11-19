import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadImage = async (buffer, fileName) => {
  try {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME, // Asegúrate de que el nombre del bucket es correcto
      Key: `images/${Date.now()}-${fileName}`, // O cualquier prefijo que desees para las imágenes
      Body: buffer,
      ContentType: 'image/jpeg', // O el tipo MIME correcto de la imagen
    };

    // No incluimos la propiedad ACL si el bucket no lo permite
    // Uploading image to S3
    const data = await s3Client.send(new PutObjectCommand(uploadParams));

    // Retorna la URL del archivo cargado
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error('Error al subir la imagen a S3:', error);
    throw new Error('Error al subir la imagen a S3');
  }
};
