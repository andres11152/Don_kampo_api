"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbSettings = exports.PORT = exports.API_KEY = void 0;
var _dotenv = require("dotenv");
(0, _dotenv.config)();
var PORT = exports.PORT = process.env.PORT || 8080;
var dbSettings = exports.dbSettings = {
  user: process.env.DB_USER || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  password: process.env.DB_PW || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
};
var API_KEY = exports.API_KEY = process.env.API_KEY || '';