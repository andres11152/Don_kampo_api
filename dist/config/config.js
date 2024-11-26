"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbSettings = exports.PORT = exports.API_KEY = void 0;
var _dotenv = require("dotenv");
(0, _dotenv.config)();
const PORT = exports.PORT = parseInt(process.env.PORT) || process.argv[2] || 8080;
const dbSettings = exports.dbSettings = {
  user: process.env.DB_USER || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  password: process.env.DB_PW || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 6089
};
const API_KEY = exports.API_KEY = process.env.API_KEY || '';
//# sourceMappingURL=config.js.map