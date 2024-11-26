"use strict";

var _fs = _interopRequireDefault(require("fs"));
var _connection = require("../database/connection.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const runMigration = async () => {
  const client = await (0, _connection.getConnection)();
  try {
    const sql = _fs.default.readFileSync("src/database/db.sql", "utf-8");
    await client.query(sql);
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
};
runMigration();