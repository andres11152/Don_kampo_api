import { config } from 'dotenv';
config();

export const PORT = process.env.PORT || 8080;

export const dbSettings = {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '',
    database: process.env.DB_NAME || '',
    password: process.env.DB_PW || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
}

export const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.ALLOWED_ORIGIN || 'https://donkampo.com', // Lee la variable de entorno
  ];

export const API_KEY = process.env.API_KEY || '';