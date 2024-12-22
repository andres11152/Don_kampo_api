import pg from 'pg';
import { dbSettings } from '../config/config.js';

const { Pool } = pg;
const pool = new Pool(dbSettings);

// Función para obtener una conexión del pool
export const getConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    return client; // Retorna el cliente para su uso
  } catch (error) {
    console.error('Error al obtener la conexión:', error.message);
    throw error; // Lanza el error para que el controlador lo gestione
  }
};

// Prueba inicial de conexión a la base de datos
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');
    client.release(); // Libera la conexión después de usarla
  } catch (error) {
    console.error('Error al probar la conexión:', error.message);
  }
};

// Ejecutar la prueba de conexión al cargar este módulo
testConnection();

// Exportar el pool para consultas directas en controladores
export default pool;
