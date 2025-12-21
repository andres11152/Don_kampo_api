/**
 * @fileoverview Constantes por defecto para toda la aplicación
 * Centraliza valores hardcodeados como URLs de imágenes predeterminadas
 */

/**
 * URLs de imágenes por defecto
 * Configurables mediante variables de entorno
 */
export const DEFAULT_IMAGES = {
  /**
   * Imagen predeterminada para productos
   * Se usa cuando un producto no tiene imagen asignada
   */
  PRODUCT:
    process.env.DEFAULT_PRODUCT_IMAGE ||
    "https://www.donkampo.com/images/default-product.jpg",

  /**
   * Imagen predeterminada para anuncios/banners
   * Se usa cuando un anuncio no tiene imagen asignada
   */
  ADVERTISEMENT:
    process.env.DEFAULT_ADVERTISEMENT_IMAGE ||
    "https://www.donkampo.com/images/1.png",
};

/**
 * Configuraciones por defecto de la aplicación
 */
export const DEFAULT_CONFIG = {
  /**
   * Orden mínima por defecto (en pesos colombianos)
   * Puede ser sobreescrito por la configuración en la base de datos
   */
  MINIMUM_ORDER: process.env.DEFAULT_MINIMUM_ORDER || 50000,

  /**
   * Costo de envío por defecto (en pesos colombianos)
   * Puede ser sobreescrito según la ubicación del cliente
   */
  SHIPPING_COST: process.env.DEFAULT_SHIPPING_COST || 5000,
};

/**
 * Mensajes de error estandarizados
 */
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Ha ocurrido un error interno del servidor",
  INVALID_CREDENTIALS: "Credenciales inválidas",
  UNAUTHORIZED: "No autorizado",
  NOT_FOUND: "Recurso no encontrado",
  VALIDATION_ERROR: "Error de validación",
};

/**
 * Códigos de respuesta HTTP comunes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
