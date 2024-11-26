"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadImage = void 0;
var _clientS = require("@aws-sdk/client-s3");
var _mimeTypes = require("mime-types");
var _nanoid = require("nanoid");
const s3Client = new _clientS.S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const uploadImage = async (buffer, fileName) => {
  try {
    const mimeType = (0, _mimeTypes.lookup)(fileName) || 'application/octet-stream';
    const uniqueFileName = `${(0, _nanoid.nanoid)()}-${fileName}`;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${uniqueFileName}`,
      Body: buffer,
      ContentType: mimeType
    };
    const data = await s3Client.send(new _clientS.PutObjectCommand(uploadParams));
    console.log('Imagen subida exitosamente:', data);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error('Error al subir la imagen a S3:', error);
    throw new Error(`Error al subir la imagen a S3: ${error.message}`);
  }
};
exports.uploadImage = uploadImage;