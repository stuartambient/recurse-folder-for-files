import fs from "node:fs";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

const createTable = async () => {
  const stmt = db.prepare(
    "CREATE TABLE IF NOT EXISTS albums(_id text, rootloc text, foldername text, fullpath text)"
  );

  const info = await stmt.run();
  console.log(info);
  db.close();
};

createTable();

const searchTable = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  console.log(info);
  db.close();
};

const insertAlbums = async data => {
  const insert = db.prepare(
    "INSERT INTO albums(_id, rootloc, foldername, fullpath) VALUES (@_id, @root, @name, @fullpath)"
  );

  const insertMany = db.transaction(albums => {
    for (const a of albums) insert.run(a);
  });

  const info = await insertMany(data);
  console.log("⚡ :", info);
  db.close();
};

const results = data => {
  const albumsArr = [];
  data.forEach(d => {
    const _id = uuidv4();
    const split = d.split("/");
    const root = `${split[0]}/${split[1]}`;
    const name = split[2];
    const fullpath = d;
    albumsArr.push({ _id, root, name, fullpath });
  });
  return insertAlbums(albumsArr);
};

const back = (roots, all = []) => {
  if (!roots.length) return results(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  back(roots, all);
};

back([
  "J:/S_Music",
  "I:/Music",
  "H:/Top/Music",
  "F:/Music",
  "D:/G_MUSIC",
  "D:/music",
]);

/* searchTable(); */
