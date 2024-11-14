import pg from 'pg'; // Importa la clase Pool desde el módulo pg
import { dbSettings } from '../config/config.js'; // Importa la configuración de la base de datos

const {
  Pool
} = pg;
const pool = new Pool(dbSettings); // Crea una instancia del pool con la configuración

/**
 * Devuelve una conexión al pool de la base de datos PostgreSQL.
 * @returns {Promise<Client>} - Un cliente conectado del pool
 */
export const getConnection = async () => {
  try {
    const client = await pool.connect(); // Obtiene un cliente del pool
    return client; // Devuelve el cliente para que se use en controladores
  } catch (error) {
    console.error('Error al obtener la conexión:', error.message);
    throw error;
  }
};

/**
 * Función principal para verificar la conexión a la base de datos.
 */
const testConnection = async () => {
  try {
    const client = await pool.connect(); // Obtiene un cliente del pool
    console.log('Conexión exitosa a la base de datos');
    client.release(); // Libera el cliente de nuevo al pool
  } catch (error) {
    console.error('Error en la conexión:', error.message); // Maneja los errores en la conexión
  }
};

// Ejecuta la prueba de conexión
testConnection();