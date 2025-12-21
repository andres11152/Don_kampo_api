import pg from "pg";
import { dbSettings } from "../config/config.js"; // Corregido para apuntar a la carpeta correcta

const { Pool } = pg;

// --- LÓGICA DE CONFIGURACIÓN MEJORADA ---
// Priorizamos la connectionString para entornos de producción (como Render).
// Si no existe, usamos los ajustes individuales para desarrollo local.
const poolConfig = process.env.DATABASE_URL
  ? {
      // Configuración para producción/Render usando la URL de conexión
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Requerido por muchos proveedores de DB en la nube
      },
    }
  : {
      // Configuración para desarrollo local usando variables de entorno individuales
      user: dbSettings.user,
      host: dbSettings.host,
      database: dbSettings.database,
      password: dbSettings.password,
      port: dbSettings.port,
      ssl: false, // Generalmente no se usa SSL en local
    };

const pool = new Pool({
  ...poolConfig,
  // Opciones del pool para mejorar la estabilidad
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo que un cliente puede estar inactivo antes de cerrarse
  connectionTimeoutMillis: 10000, // 10s - Aumentado para conexiones remotas lentas
  statement_timeout: 30000, // 30s - Timeout para queries individuales
});

// Evento para capturar errores en clientes inactivos del pool
pool.on("error", (err, client) => {
  console.error(
    "Error inesperado en un cliente inactivo del pool de PostgreSQL",
    err
  );
});

// Función para obtener una conexión del pool de forma segura
export const getConnection = async () => {
  // 🔍 DEBUG: Mostrar estado del pool
  console.log("📊 Pool status:", {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });

  const client = await pool.connect();
  console.log("✅ Cliente obtenido del pool");
  return client;
};

// Función para probar la conexión al iniciar la aplicación
export const testConnection = async () => {
  let client;
  try {
    client = await getConnection();
    console.log("✅ Conexión exitosa a PostgreSQL.");
    const res = await client.query("SELECT NOW()");
    console.log("🕒 Hora del servidor de la base de datos:", res.rows[0].now);
  } catch (error) {
    console.error(
      "❌ Error fatal al conectar con la base de datos:",
      error.message
    );
  } finally {
    if (client) client.release(); // Siempre libera el cliente
  }
};

export default pool;
