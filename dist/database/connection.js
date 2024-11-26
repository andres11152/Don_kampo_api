import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import pg from 'pg';
import { dbSettings } from '../config/config.js';
const {
  Pool
} = pg;
const pool = new Pool(dbSettings);
export const getConnection = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    try {
      const client = yield pool.connect();
      return client;
    } catch (error) {
      console.error('Error al obtener la conexión:', error.message);
      throw error;
    }
  });
  return function getConnection() {
    return _ref.apply(this, arguments);
  };
}();
const testConnection = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* () {
    try {
      const client = yield pool.connect();
      console.log('Conexión exitosa a la base de datos');
      client.release();
    } catch (error) {
      console.error('Error en la conexión:', error.message);
    }
  });
  return function testConnection() {
    return _ref2.apply(this, arguments);
  };
}();
testConnection();