import Database from "better-sqlite3";
import fs from "node:fs";

const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

const roots = [
  "J:/S_Music/",
  "I:/Music/",
  "H:/Top/Music/",
  "F:/Music/",
  "D:/G_MUSIC/",
  "D:/music/",
];

const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "a" });
  file.on("error", err => console.log(err));
  file.write(data + "\n");

  file.end();
};

const nullMainMeta = () => {
  const stmt = db.prepare(
    "SELECT audioFile FROM files WHERE artist IS NULL OR title IS NULL OR album IS NULL "
  );
  const info = stmt.all();
  console.log(info);
  db.close();
};

const nullPicture = () => {
  const stmt = db.prepare("SELECT audioFile FROM files WHERE picture IS NULL");
  const info = stmt.all();
  console.log(info);
  db.close();
};

const nullGenre = () => {
  const stmt = db.prepare("SELECT audioFile FROM files WHERE genre IS NULL");
  const info = stmt.all();
  console.log(info);
  db.close();
};

const countGenre = () => {
  const stmt = db.prepare(
    /* check type case in general */
    "SELECT COUNT(*) FROM files WHERE genre IS NULL"
  );
  const info = stmt.all();
  console.log(info);
  db.close();
};

const allIds = () => {
  const stmt = db.prepare("SELECT afid, audioFile FROM files");
  const info = stmt.all();
  return info;
  db.close;
};

const createView = () => {
  const tempView = db.prepare(
    "CREATE VIEW genres AS SELECT DISTINCT album, artist FROM files GROUP BY album"
  );
  const view = tempView.run();
  console.log(view);
  db.close();
};

const useView = () => {
  const myview = db.prepare("SELECT * FROM genres");
  const c = myview.all();
  console.log(c);
  db.close();
};

/* const idxs = db.pragma("index_list(files)");
console.log(idxs); */

const getFileRoot = () => {
  const rootsql = db.prepare(
    /* "SELECT audioFile FROM files WHERE audioFile LIKE '%F:/Music%'" */
    "SELECT COUNT(audioFile) FROM files WHERE audioFile LIKE '%F:/Music%'"
  );
  const filter = rootsql.all();
  console.log("filter: ", filter);
  db.close();
};

const updateRoot = () => {
  const rootsql = db.prepare(
    `UPDATE files SET root = ? WHERE audioFile LIKE ?`
  );
  /*   const info = rootsql.run("F:/Music/", "%F:/Music/%"); */
  const updateMany = db.transaction(roots => {
    for (const r of roots) rootsql.run(`${r}`, `%${r}%`);
  });

  updateMany(roots);
  db.close();
};

updateRoot();
const extension = type => {
  const stmt = db.prepare(
    "SELECT audioFile FROM files WHERE extension = '.ape' OR extension = '.m4a' OR extension = '.ogg' ORDER BY extension"
  );
  /*   const extensions = stmt.all(); */
  for (const ext of stmt.iterate()) {
    writeFile(ext.audioFile, "./lesser-extensions");
  }

  db.close();
};

const typeTotals = type => {
  const totals = db.prepare("SELECT COUNT(*) FROM files WHERE extension = ?");
  const totalCount = totals.all(type);
  console.log(totalCount[0]["COUNT(*)"]);
  db.close();
};

/* typeTotals(".ogg"); */
/* getFileRoot(); */
/* export { allIds };  */
