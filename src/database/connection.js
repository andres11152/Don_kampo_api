import { Client } from 'pg'; // Importa directamente la clase Client desde el módulo pg
import { dbSettings } from '../config/config.js'; // Importa la configuración de la base de datos

/**
 * Establece y devuelve una conexión a la base de datos PostgreSQL.
 * @returns {Promise<Client>} - El cliente de la base de datos conectado
 * @throws {Error} - Lanza un error si la conexión falla
 */
export const getConnection = async () => {
  const client = new Client(dbSettings); // Crea una nueva instancia del cliente con la configuración

  try {
    await client.connect(); // Intenta conectar el cliente a la base de datos
    console.log('Conexión a la base de datos establecida');
    return client; // Devuelve el cliente conectado
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    await client.end(); // Asegura que la conexión se cierra en caso de error
    throw error; // Reenvía el error para que pueda ser manejado externamente
  }
};

/**
 * Función principal para verificar la conexión a la base de datos.
 */
const testConnection = async () => {
  try {
    const client = await getConnection(); // Establece la conexión a la base de datos
    console.log('Conexión exitosa a la base de datos'); 
    await client.end(); // Cierra la conexión después de verificarla
  } catch (error) {
    console.error('Error en la conexión:', error.message); // Maneja los errores en la conexión
  }
};

// Ejecuta la prueba de conexión
testConnection();
