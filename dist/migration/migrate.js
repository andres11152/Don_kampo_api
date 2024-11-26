import fs from "fs";
import { getConnection } from "../database/connection.js";
const runMigration = async () => {
  const client = await getConnection();
  try {
    const sql = fs.readFileSync("src/database/db.sql", "utf-8");
    await client.query(sql);
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
};
runMigration();
//# sourceMappingURL=migrate.js.map