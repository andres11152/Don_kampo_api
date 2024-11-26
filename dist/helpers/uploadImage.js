import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';
import { nanoid } from 'nanoid';
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
export const uploadImage = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (buffer, fileName) {
    try {
      const mimeType = lookup(fileName) || 'application/octet-stream';
      const uniqueFileName = `${nanoid()}-${fileName}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${uniqueFileName}`,
        Body: buffer,
        ContentType: mimeType
      };
      const data = yield s3Client.send(new PutObjectCommand(uploadParams));
      console.log('Imagen subida exitosamente:', data);
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (error) {
      console.error('Error al subir la imagen a S3:', error);
      throw new Error(`Error al subir la imagen a S3: ${error.message}`);
    }
  });
  return function uploadImage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=uploadImage.js.map