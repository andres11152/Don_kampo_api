import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import pg from 'pg';
import { dbSettings } from '../config/config.js';
const {
  Pool
} = pg;
const pool = new Pool(dbSettings);

// Función para obtener una conexión del pool
export const getConnection = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    let client;
    let attempts = 0;
    const maxRetries = 5;
    const retryDelay = 5000;
    while (attempts < maxRetries) {
      try {
        client = yield pool.connect();
        console.log('Conexión exitosa a la base de datos');
        return client;
      } catch (error) {
        attempts++;
        console.error(`Intento ${attempts} fallido: ${error.message}`);
        if (attempts < maxRetries) {
          console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
          yield new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.error('No se pudo establecer la conexión después de varios intentos');
          throw error;
        }
      }
    }
  });
  return function getConnection() {
    return _ref.apply(this, arguments);
  };
}();

// Prueba inicial de conexión a la base de datos
export const testConnection = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* () {
    try {
      const client = yield getConnection();
      console.log('Conexión exitosa a la base de datos');
      client.release();
    } catch (error) {
      console.error('Error al probar la conexión:', error.message);
    }
  });
  return function testConnection() {
    return _ref2.apply(this, arguments);
  };
}();

// Ejecutar la prueba de conexión al cargar este módulo
testConnection();

// Exportar el pool para consultas directas en controladores
export default pool;