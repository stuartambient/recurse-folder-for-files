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

/* createTable(); */

const searchTable = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  console.log(info);
  db.close();
};

const deleteAlbums = async data => {
  const deleteA = db.prepare("DELETE FROM albums WHERE fullpath = ?");
  const deleteMany = db.transaction(data => {
    for (const d of data) deleteA.run(d);
  });
  const info = deleteMany(data);
  console.log("d", info);
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

const parseNewEntries = nes => {
  const roots = [
    "J:/S_Music/",
    "F:/Music/",
    "H:/Top/Music/",
    "I:/Music/",
    "D:/music/",
    "D:/G_MUSIC/",
  ];
  const albumsArr = [];
  let root, name;
  nes.forEach(d => {
    const _id = uuidv4();
    roots.forEach(r => {
      if (d.startsWith(r)) {
        const newStr = d.replace(r, "");
        root = r;
        name = newStr;
      }
    });
    const fullpath = d;
    albumsArr.push({ _id, root, name, fullpath });
  });
  return insertAlbums(albumsArr);
};

const checkAgainstEntries = data => {
  const dbEntries = db.prepare("SELECT fullpath FROM albums");
  const ce = dbEntries.all();
  const dbe = ce.map(dbe => dbe.fullpath);
  const newEntries = data.filter(n => !dbe.includes(n));
  const missingEntries = dbe.filter(x => !data.includes(x));
  if (newEntries.length > 0) {
    parseNewEntries(newEntries);
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries);
  }
};

const back = (roots, all = []) => {
  if (!roots.length) return checkAgainstEntries(all);
  /* if (!roots.length) return parseNewEntries(all); */
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  back(roots, all);
};

/* back([
  "J:/S_Music",
  "I:/Music",
  "H:/Top/Music",
  "F:/Music",
  "D:/G_MUSIC",
  "D:/music",
]); */
/* SHOULD NEED 1MS when modified if file changes */
/* 1102762703250;
1669597033082, 1669597159899; */

const compareSize = cb => {
  /* searchTable(); */
  fs.stat(
    "J:/S_Music/Aidan Baker - Gydja Corpus Callosum/3- Aidan Baker- Somatosensory.mp3",
    (err, stats) => {
      if (err) console.log(err.message);
      /* console.log(stats); */
      return cb(stats.mtimeMs);
    }
  );
};

compareSize(res => console.log(res));
