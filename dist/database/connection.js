"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnection = void 0;
var _pg = _interopRequireDefault(require("pg"));
var _config = require("../config/config.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const {
  Pool
} = _pg.default;
const pool = new Pool(_config.dbSettings);
const getConnection = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error al obtener la conexión:', error.message);
    throw error;
  }
};
exports.getConnection = getConnection;
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');
    client.release();
  } catch (error) {
    console.error('Error en la conexión:', error.message);
  }
};
testConnection();