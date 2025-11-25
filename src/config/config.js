import { config } from 'dotenv';
config();  

export const PORT = process.env.PORT || 8080;

export const dbSettings = {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '', 
    database: process.env.DB_NAME || '', 
    password: process.env.DB_PW || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 6089, 
}


export const API_KEY = process.env.API_KEY || '';

export const authConfig = {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production'
};

// CORRECCIÓN: Se añade la configuración de AWS S3 que faltaba.
export const awsConfig = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
};
