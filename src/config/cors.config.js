/**
 * ====================================
 * CORS Configuration Module
 * ====================================
 * Configuración profesional de CORS con validación estricta
 * y logging detallado para debugging.
 *
 * @module config/cors
 */

import dotenv from "dotenv";

dotenv.config();

// ====================================
// Configuración de Orígenes Permitidos
// ====================================

/**
 * Obtiene los orígenes permitidos desde variables de entorno
 * o usa valores por defecto seguros basados en el ambiente
 */
const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGINS;

  if (envOrigins) {
    // Parsear orígenes desde variable de entorno (separados por coma)
    const origins = envOrigins.split(",").map((origin) => origin.trim());
    console.log("🌐 CORS: Orígenes cargados desde CORS_ORIGINS:", origins);
    return origins;
  }

  // Orígenes por defecto basados en NODE_ENV
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const defaultProdOrigins = [
      "https://donkampo.com",
      "https://www.donkampo.com",
    ];
    console.log(
      "🌐 CORS: Modo PRODUCCIÓN - Orígenes por defecto:",
      defaultProdOrigins
    );
    return defaultProdOrigins;
  }

  // Desarrollo: permitir localhost en múltiples puertos comunes
  const defaultDevOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
  ];
  console.log(
    "🌐 CORS: Modo DESARROLLO - Orígenes por defecto:",
    defaultDevOrigins
  );
  return defaultDevOrigins;
};

const allowedOrigins = getAllowedOrigins();

// ====================================
// Opciones de CORS
// ====================================

/**
 * Configuración de CORS con validación estricta
 * Registra intentos de acceso no autorizados para monitoreo
 */
export const corsOptions = {
  /**
   * Validación de origen con logging mejorado
   */
  origin: (origin, callback) => {
    // Caso 1: Peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) {
      const allowNoOrigin = process.env.ALLOW_NO_ORIGIN !== "false";

      if (allowNoOrigin) {
        console.log("✅ CORS: Petición sin origin header (permitida)");
        return callback(null, true);
      }

      console.warn("⚠️ CORS: Petición sin origin header (bloqueada)");
      return callback(new Error("CORS Error: Origin header requerido"), false);
    }

    // Caso 2: Origin está en la whitelist
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin permitido: ${origin}`);
      return callback(null, true);
    }

    // Caso 3: Origin NO está en la whitelist
    console.error(`❌ CORS: Origin NO PERMITIDO: ${origin}`);
    console.error(`   Orígenes permitidos: ${allowedOrigins.join(", ")}`);

    // En desarrollo, podemos ser más permisivos con un warning
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment && process.env.CORS_STRICT !== "true") {
      console.warn(
        `⚠️ CORS: PERMITIENDO origin NO AUTORIZADO en desarrollo: ${origin}`
      );
      console.warn(
        "   Para usar whitelist estricta en desarrollo, establecer CORS_STRICT=true"
      );
      return callback(null, true);
    }

    // En producción o modo estricto, bloquear
    return callback(
      new Error(
        `CORS Error: Origin '${origin}' no está permitido. Contactar al administrador.`
      ),
      false
    );
  },

  /**
   * Métodos HTTP permitidos
   */
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  /**
   * Headers permitidos en las peticiones
   */
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  /**
   * Headers expuestos en las respuestas
   */
  exposedHeaders: ["Content-Range", "X-Content-Range"],

  /**
   * Permitir el envío de cookies y credenciales
   * CRÍTICO: Necesario para autenticación con JWT en headers
   */
  credentials: true,

  /**
   * Tiempo de caché de preflight (en segundos)
   * 24 horas = 86400 segundos
   */
  maxAge: 86400,

  /**
   * Continuar procesando si CORS falla (false = bloquear)
   */
  optionsSuccessStatus: 200, // Para navegadores legacy
};

// ====================================
// Validación de Configuración
// ====================================

/**
 * Valida que la configuración de CORS sea adecuada al iniciar
 */
export const validateCorsConfig = () => {
  console.log("\n🔍 Validando configuración de CORS...");

  // Validar que hay orígenes configurados
  if (allowedOrigins.length === 0) {
    console.error("❌ ERROR: No hay orígenes configurados en CORS");
    throw new Error(
      "CORS mal configurado: debe haber al menos un origen permitido"
    );
  }

  // Validar NODE_ENV
  const env = process.env.NODE_ENV || "development";
  console.log(`   Ambiente: ${env}`);

  // Warning si estamos en producción sin CORS_ORIGINS explícito
  if (env === "production" && !process.env.CORS_ORIGINS) {
    console.warn("⚠️ WARNING: En producción sin CORS_ORIGINS explícito");
    console.warn(
      "   Recomendado: Establecer CORS_ORIGINS en variables de entorno"
    );
  }

  // Warning si CORS_STRICT está deshabilitado en producción
  if (env === "production" && process.env.CORS_STRICT === "false") {
    console.error("❌ ERROR: CORS_STRICT=false en producción NO es seguro");
    throw new Error("CORS inseguro: CORS_STRICT debe ser true en producción");
  }

  console.log("✅ Configuración de CORS validada correctamente\n");
};

// ====================================
// Exports
// ====================================

export default {
  corsOptions,
  allowedOrigins,
  validateCorsConfig,
};
