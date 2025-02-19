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
    try {
      client = yield pool.connect();
      return client; // Retorna el cliente para su uso
    } catch (error) {
      console.error('Error al obtener la conexión:', error.message);
      throw error; // Lanza el error para que el controlador lo gestione
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
      const client = yield pool.connect();
      console.log('Conexión exitosa a la base de datos');
      client.release(); // Libera la conexión después de usarla
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