import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import fs from "fs";
import { getConnection } from "../database/connection.js";
const runMigration = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    const client = yield getConnection();
    try {
      const sql = fs.readFileSync("src/database/db.sql", "utf-8");
      yield client.query(sql);
    } catch (error) {
      console.log(error);
    } finally {
      yield client.end();
    }
  });
  return function runMigration() {
    return _ref.apply(this, arguments);
  };
}();
runMigration();