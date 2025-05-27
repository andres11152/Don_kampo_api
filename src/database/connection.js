import pg from 'pg';
import { dbSettings } from '../config/config.js';

const { Pool } = pg;
const pool = new Pool(dbSettings);

// Función para obtener una conexión del pool
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

// Prueba inicial de conexión a la base de datos
export const testConnection = async () => {
  try {
    const client = await getConnection();
    console.log('Conexión exitosa a la base de datos');
    client.release(); 
  } catch (error) {
    console.error('Error al probar la conexión:', error.message);
  }
};

// Ejecutar la prueba de conexión al cargar este módulo
testConnection();

// Exportar el pool para consultas directas en controladores
export default pool;
