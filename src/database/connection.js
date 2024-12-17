import pg from 'pg';
import { dbSettings } from '../config/config.js';

const { Pool } = pg;
const pool = new Pool(dbSettings);

export const getConnection = async () => {
  let client;
  let attempts = 0;
  const maxRetries = 5; 
  const retryDelay = 5000;

  while (attempts < maxRetries) {
    try {
      client = await pool.connect();
      console.log('Conexión exitosa a la base de datos');
      return client;  
    } catch (error) {
      attempts++;
      console.error(`Intento ${attempts} fallido: ${error.message}`);

      if (attempts < maxRetries) {
        console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error('No se pudo establecer la conexión después de varios intentos');
        throw error; 
      }
    }
  }
};

const testConnection = async () => {
  try {
    const client = await getConnection();
    console.log('Conexión exitosa a la base de datos');
    client.release(); 
  } catch (error) {
    console.error('Error en la conexión:', error.message);
  }
};

testConnection();
