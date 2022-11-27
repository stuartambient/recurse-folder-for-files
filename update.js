import Database from "better-sqlite3";

const db = new Database("./db/audiofiles.db", { verbose: console.log });

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
getFileRoot();
export { allIds };
