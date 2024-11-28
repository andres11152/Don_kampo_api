import pg from 'pg';
import { dbSettings } from '../config/config.js';
const {
  Pool
} = pg;
const pool = new Pool(dbSettings);
export const getConnection = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error al obtener la conexión:', error.message);
    throw error;
  }
};
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');
    client.release();
  } catch (error) {
    console.error('Error en la conexión:', error.message);
  }
};
testConnection();