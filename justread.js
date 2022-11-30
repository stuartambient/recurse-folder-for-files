import fs from "node:fs";
import { EventEmitter } from "node:events";
import path from "node:path";
import { Buffer } from "node:buffer";
import { parseFile } from "music-metadata";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import {
  roots,
  playlistExtensions,
  audioExtensions,
} from "./constant/constants.js";

/* import { allIds } from "./update.js"; */
// ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

/* const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "a" });
  file.on("error", err => console.log(err));
  file.write(data + "\n");

  file.end();
}; */

/* const parseMeta = async (files, cb) => {
  const filesWMetadata = [];
  for (const audioFile of files) {
    const modified = fs.statSync(audioFile).mtimeMs;
    try {
      const metadata = await parseFile(audioFile);
      let { year, title, artist, album, genre, picture } = metadata.common;
      const { lossless, bitrate, sampleRate } = metadata.format;
      const afid = uuidv4();

      filesWMetadata.push({
        afid,
        audioFile,
        modified,
        extension: path.extname(audioFile),
        year,
        title,
        artist,
        album,
        genre: genre ? (genre = genre.join(",")) : null,
        picture: picture ? (picture = picture[0].data) : null,
        lossless: lossless === false ? 0 : 1,
        bitrate,
        sampleRate,
      });
    } catch (err) {
      writeFile(audioFile, "./metadataErrors.txt");
      console.error(err);
    }
  }
  cb(filesWMetadata);
}; */

/* const playlistFiles = [
  ".m3u",
  ".PLS",
  ".XSPF",
  ".WVX",
  ".CONF",
  ".ASX,",
  ".IFO,",
  ".CUE",
];
const audioFiles = [".mp3", ".flac", ".ape", ".m4a", ".ogg"]; */

const scan = (dirs, files = [], cb) => {
  if (!dirs.length) return cb(files.sort(), files.length);

  const next = dirs.shift();

  const folder = fs.readdirSync(next);
  const f = folder
    .filter(
      o =>
        fs.statSync(`${next}/${o}`).isFile() &&
        audioExtensions.includes(path.extname(`${next}/${o}`))
    )
    .map(el => `${next}/${el}`);
  const d = folder
    .filter(o => fs.statSync(`${next}/${o}`).isDirectory())
    .map(el => `${next}/${el}`);
  process.nextTick(() => scan([...dirs, ...d], [...files, ...f], cb));
};

const results = res => {
  const filesWithMetadata = async wMeta => {
    console.log(Date());
    const insert = db.prepare(
      "INSERT INTO files VALUES (@afid, null, @audioFile, @modified, @extension, @year, @title, @artist, @album, @genre, @picture, @lossless, @bitrate, @sampleRate, 0)"
    );

    const insertMany = db.transaction(files => {
      for (const f of files) insert.run(f);
    });

    insertMany(wMeta);
    db.close();
  };
  const xtractedFiles = (files, length) => {
    /* parseMeta(files, filesWithMetadata); */
    const dbFiles = db.prepare("SELECT audioFile FROM files");
    const df = dbFiles.all();
    const dbAll = df.map(d => d.audioFile);

    /* dbAll.forEach(d => console.log(d)); */

    /* const newEntries = files.filter(n => !dbAll.includes(n)); */
    /*  const missingEntries = dbAll.filter(y => !files.includes(y));   */
    /* parseMeta(newEntries, filesWithMetadata); */
    /* console.log(newEntries, missingEntries); */
    /*  db.close(); */
    /* console.log(newEntries); */
    db.close();
  };
  scan(res, [], xtractedFiles);
};

const run = (roots, all = []) => {
  console.log(Date());
  if (!roots.length) return results(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  run(roots, all);
};

run(roots);
