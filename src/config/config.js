import { config } from 'dotenv';
config();  

export const PORT = process.env.PORT || 8080;

export const dbSettings = {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '', 
    database: process.env.DB_NAME || '', 
    password: process.env.DB_PW || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 6089, 
    max: process.env.DB_MAX || 10, 
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, 
    connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 2000,
}


export const API_KEY = process.env.API_KEY || '';
