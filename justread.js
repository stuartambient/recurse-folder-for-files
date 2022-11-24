import fs from "node:fs";
import { EventEmitter } from "node:events";
import path from "node:path";
import { Buffer } from "node:buffer";
import { parseFile } from "music-metadata";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
// ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");
console.log(db);
/* db.prepare(
  `CREATE TABLE files (afid primary key not null, 
                audioFile text not null,
                year, 
                title, 
                artist,
                album, 
                genre, 
                picture, 
                lossless,
                bitrate,
                sample_rate)`
).run(); */

/* db.prepare('DROP TABLE file').run(); */
/* import client from './db/index.js'; */

/* console.log(client); */

const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "w+" });
  file.on("error", err => console.log(err));
  if (Array.isArray(data)) {
    data.forEach(function (v) {
      file.write(v + "\n");
    });
  }
  file.end();
};

const parseMeta = async (files, cb) => {
  const filesWMetadata = [];
  for (const audioFile of files) {
    try {
      const metadata = await parseFile(audioFile);
      const { year, title, artist, album, genre, picture } = metadata.common;
      const { lossless, bitrate, sampleRate } = metadata.format;
      let genre1, imgData, isLossless;
      genre ? (genre1 = genre[0]) : null;
      picture ? (imgData = picture[0].data) : null;
      lossless === false ? (isLossless = 0) : (isLossless = 1);

      const afid = uuidv4();

      filesWMetadata.push({
        afid,
        audioFile,
        year,
        title,
        artist,
        album,
        genre1,
        imgData,
        isLossless,
        bitrate,
        sampleRate,
      });
    } catch (err) {
      writeFile(audioFile, "./metadataErrors.txt");
      console.error(err);
    }
  }
  cb(filesWMetadata);
};

const playlistFiles = [
  ".m3u",
  ".PLS",
  ".XSPF",
  ".WVX",
  ".CONF",
  ".ASX,",
  ".IFO,",
  ".CUE",
];
const audioFiles = [".mp3", ".flac", ".ape", ".m4a", ".ogg"];

const scan = (dirs, files = [], cb) => {
  if (!dirs.length) return cb(files.sort(), files.length);

  const next = dirs.shift();

  const folder = fs.readdirSync(next);
  const f = folder
    .filter(
      o =>
        fs.statSync(`${next}/${o}`).isFile() &&
        audioFiles.includes(path.extname(`${next}/${o}`))
    )
    .map(el => `${next}/${el}`);
  const d = folder
    .filter(o => fs.statSync(`${next}/${o}`).isDirectory())
    .map(el => `${next}/${el}`);
  process.nextTick(() => scan([...dirs, ...d], [...files, ...f], cb));
};

const results = res => {
  const filesWithMetadata = async wMeta => {
    const insert = db.prepare(
      "INSERT INTO files VALUES (@afid, @audioFile, @year, @title, @artist, @album, @genre1, @imgData, @isLossless, @bitrate, @sampleRate)"
    );

    const insertMany = db.transaction(files => {
      for (const f of files) insert.run(f);
    });

    insertMany(wMeta);
  };
  const xtractedFiles = (files, length) => {
    parseMeta(files, filesWithMetadata);
  };
  scan(res, [], xtractedFiles);
};

const back = (roots, all = []) => {
  if (!roots.length) return results(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  back(roots, all);
};

back([
  /* "J:S_Music", */
  /* 'I:/Music',
  'H:/Top/Music',
  'F:/Music',*/
  "D:/G_MUSIC",
  "D:/music",
]);
