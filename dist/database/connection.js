import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import pg from 'pg';
import { dbSettings } from '../config/config.js';
const {
  Pool
} = pg;
const pool = new Pool(dbSettings);

// Función para obtener la conexión con reintentos automáticos
export const getConnection = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    let client;
    let attempts = 0;
    const maxRetries = 5; // Número máximo de intentos de reconexión
    const retryDelay = 5000; // Tiempo de espera entre intentos (en milisegundos)

    while (attempts < maxRetries) {
      try {
        // Intentamos obtener la conexión
        client = yield pool.connect();
        console.log('Conexión exitosa a la base de datos');
        return client; // Retornamos el cliente si la conexión es exitosa
      } catch (error) {
        attempts++;
        console.error(`Intento ${attempts} fallido: ${error.message}`);
        if (attempts < maxRetries) {
          console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
          yield new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.error('No se pudo establecer la conexión después de varios intentos');
          throw error; // Lanza el error si se alcanza el número máximo de intentos
        }
      }
    }
  });
  return function getConnection() {
    return _ref.apply(this, arguments);
  };
}();

// Función para probar la conexión
const testConnection = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* () {
    try {
      const client = yield getConnection();
      console.log('Conexión exitosa a la base de datos');
      client.release(); // Liberamos el cliente después de usarlo
    } catch (error) {
      console.error('Error en la conexión:', error.message);
    }
  });
  return function testConnection() {
    return _ref2.apply(this, arguments);
  };
}();

// Llamamos a la función de prueba
testConnection();