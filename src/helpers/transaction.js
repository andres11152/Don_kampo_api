/**
 * @fileoverview Helper para manejo de transacciones de base de datos
 * Centraliza la lógica de BEGIN/COMMIT/ROLLBACK para evitar código repetitivo
 */

/**
 * Ejecuta una función dentro de una transacción de base de datos
 * Maneja automáticamente BEGIN, COMMIT y ROLLBACK
 *
 * @param {Object} client - Cliente de conexión a PostgreSQL de pg pool
 * @param {Function} callback - Función async que recibe el cliente y ejecuta operaciones
 * @returns {Promise<any>} - El resultado retornado por la callback
 *
 * @example
 * // Uso básico
 * const result = await withTransaction(client, async (trx) => {
 *   await trx.query(queries.orders.create, [orderData]);
 *   await trx.query(queries.orderItems.create, [itemsData]);
 *   return { orderId: 123 };
 * });
 *
 * @example
 * // Con manejo de errores personalizado
 * try {
 *   await withTransaction(client, async (trx) => {
 *     const order = await trx.query(queries.orders.create, [data]);
 *     const items = await trx.query(queries.items.create, [items]);
 *     return { order, items };
 *   });
 * } catch (error) {
 *   console.error('Error en transacción:', error);
 *   // El ROLLBACK ya fue ejecutado automáticamente
 * }
 */
export const withTransaction = async (client, callback) => {
  try {
    // Iniciar transacción
    await client.query("BEGIN");

    // Ejecutar callback con el cliente transaccional
    const result = await callback(client);

    // Si todo sale bien, hacer commit
    await client.query("COMMIT");

    return result;
  } catch (error) {
    // Si hay error, hacer rollback
    await client.query("ROLLBACK");

    // Re-lanzar el error para que el caller pueda manejarlo
    throw error;
  }
};

/**
 * Ejecuta múltiples operaciones en una transacción usando un pool de conexiones
 * Se encarga de obtener y liberar la conexión automáticamente
 *
 * @param {Object} pool - Pool de conexiones de PostgreSQL
 * @param {Function} callback - Función async que recibe el cliente y ejecuta operaciones
 * @returns {Promise<any>} - El resultado retornado por la callback
 *
 * @example
 * import { getPool } from '../database/connection.js';
 *
 * const pool = getPool();
 * const result = await executeTransaction(pool, async (client) => {
 *   await client.query(queries.products.create, [productData]);
 *   await client.query(queries.variations.create, [variationData]);
 *   return { success: true };
 * });
 */
export const executeTransaction = async (pool, callback) => {
  const client = await pool.connect();

  try {
    const result = await withTransaction(client, callback);
    return result;
  } finally {
    // Siempre liberar la conexión, incluso si hay error
    client.release();
  }
};

/**
 * Wrapper para ejecutar queries con retry automático en caso de deadlock
 * Útil para operaciones que pueden fallar por locks de base de datos
 *
 * @param {Object} client - Cliente de conexión a PostgreSQL
 * @param {Function} callback - Función async que ejecuta la query
 * @param {number} maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} delayMs - Delay entre reintentos en ms (default: 100)
 * @returns {Promise<any>} - El resultado de la query
 *
 * @example
 * await withRetry(client, async () => {
 *   return await client.query(queries.orders.updateStock, [productId]);
 * }, 3, 100);
 */
export const withRetry = async (
  client,
  callback,
  maxRetries = 3,
  delayMs = 100
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callback(client);
    } catch (error) {
      lastError = error;

      // Verificar si es un error de deadlock (código 40P01 en PostgreSQL)
      if (error.code === "40P01" && attempt < maxRetries - 1) {
        // Esperar antes de reintentar
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * (attempt + 1))
        );
        continue;
      }

      // Si no es deadlock o ya no hay más reintentos, lanzar el error
      throw error;
    }
  }

  throw lastError;
};

/**
 * Ejecuta múltiples queries en batch dentro de una transacción
 * Útil para operaciones masivas (bulk inserts, updates, etc.)
 *
 * @param {Object} client - Cliente de conexión a PostgreSQL
 * @param {Array<{query: string, params: Array}>} operations - Array de operaciones a ejecutar
 * @returns {Promise<Array>} - Array con los resultados de cada query
 *
 * @example
 * await batchTransaction(client, [
 *   { query: queries.products.create, params: [product1Data] },
 *   { query: queries.products.create, params: [product2Data] },
 *   { query: queries.products.create, params: [product3Data] },
 * ]);
 */
export const batchTransaction = async (client, operations) => {
  return await withTransaction(client, async (trx) => {
    const results = [];

    for (const { query, params } of operations) {
      const result = await trx.query(query, params);
      results.push(result);
    }

    return results;
  });
};
