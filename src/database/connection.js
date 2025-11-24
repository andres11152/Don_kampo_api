import pg from 'pg';
import { dbSettings } from '../config/config.js';

const { Pool } = pg;

// Configuración robusta para Render y entornos locales
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } // Render requiere esto
    : false, // En local sin SSL (si tu postgres local no tiene SSL)
  
  // Opcional: Configuración del pool
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para obtener una conexión del pool
export const getConnection = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error al obtener conexión del pool:', error.message);
    throw error;
  }
};

// Prueba inicial de conexión
export const testConnection = async () => {
  let client;
  try {
    client = await getConnection();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    const res = await client.query('SELECT NOW()');
    console.log('🕒 Hora del servidor DB:', res.rows[0].now);

  } catch (error) {
    console.error('❌ Error fatal al conectar a la base de datos:', error.message);
  } finally {
    if (client) client.release();
  }
};

testConnection();

pool.on('error', (err, client) => {
  console.error('Error inesperado en cliente de PostgreSQL inactivo', err);
});

export default pool;