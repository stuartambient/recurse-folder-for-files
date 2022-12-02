import Database from "better-sqlite3";
import { roots } from "./constant/constants.js";
const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

const createTable = () => {
  const ct = db.prepare("CREATE TABLE IF NOT EXISTS mytable ( col1, col2)");
  const createtable = ct.run();
  db.close();
};

const createIndex = () => {
  const createIdx = db.prepare(
    "CREATE INDEX audiofile_idx ON files(audioFile)"
  );
  const idx = createIdx.run();
  db.close();
};

const updateRoot = () => {
  console.log(roots);
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

/* db.backup(`audiofiles-bu.db`)
  .then(() => {
    console.log("backup complete!");
  })
  .catch(err => {
    console.log("backup failed:", err);
  }); */

const insertFiles = (files, cb) => {
  const insert = db.prepare(
    "INSERT INTO files VALUES (@afid, null, @audioFile, @modified, @extension, @year, @title, @artist, @album, @genre, @picture, @lossless, @bitrate, @sampleRate, 0)"
  );

  const insertMany = db.transaction(files => {
    for (const f of files) insert.run(f);
  });

  const info = insertMany(files);
  /* db.close(); */
  cb(info);
};

const deleteFiles = (files, cb) => {
  const deleteFile = db.prepare("DELETE FROM files WHERE audioFile = ?");

  const deleteMany = db.transaction(files => {
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);
  cb(info);
  /* db.close(); */
};

const insertAlbums = (data, cb) => {
  const insert = db.prepare(
    "INSERT INTO albums(_id, rootloc, foldername, fullpath) VALUES (@_id, @root, @name, @fullpath)"
  );

  const insertMany = db.transaction(albums => {
    for (const a of albums) insert.run(a);
  });

  const info = insertMany(data);
  cb(info);
  /* db.close(); */
};

const deleteAlbums = async (data, cb) => {
  const deleteA = db.prepare("DELETE FROM albums WHERE fullpath = ?");
  const deleteMany = db.transaction(data => {
    for (const d of data) deleteA.run(d);
  });
  const info = deleteMany(data);
  cb(info);
  /* db.close(); */
};

const getAlbums = () => {
  const getAllAlbums = db.prepare("SELECT fullpath FROM albums");
  const albums = getAllAlbums.all();
  /* db.close(); */
  return albums;
};

const getFiles = () => {
  const allFiles = db.prepare("SELECT audioFile FROM files");
  const files = allFiles.all();
  /* db.close(); */
  return files;
};

const searchAlbums = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  console.log(info);
  /*  db.close(); */
};

export {
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteFiles,
  getAlbums,
  getFiles,
};
