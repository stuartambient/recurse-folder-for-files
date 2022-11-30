import Database from "better-sqlite3";
const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

const createTable = () => {
  const ct = db.prepare("CREATE TABLE IF NOT EXISTS mytable ( col1, col2)");
  const createtable = ct.run();
  db.close();
};
