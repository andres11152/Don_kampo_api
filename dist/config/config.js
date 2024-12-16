import { config } from 'dotenv';
config();
export const PORT = process.env.PORT || 8080;
export const dbSettings = {
  user: process.env.DB_USER || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  password: process.env.DB_PW || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 6089
};
export const API_KEY = process.env.API_KEY || '';