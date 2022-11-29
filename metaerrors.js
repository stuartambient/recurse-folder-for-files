import fs from "node:fs";
import { EventEmitter } from "node:events";
import path from "node:path";
import { Buffer } from "node:buffer";
import { parseFile } from "music-metadata";

const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "a" });
  file.on("error", err => console.log(err));
  file.write(data + "\n");

  file.end();
};

const parseMeta = async (files, cb) => {
  const filesWMetadata = [];
  for (const audioFile of files) {
    /* const modified = fs.statSync(audioFile).mtimeMs; */
    try {
      const metadata = await parseFile(audioFile);
      console.log(metadata.common.title);
      /* let { year, title, artist, album, genre, picture } = metadata.common;
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
      }); */
    } catch (err) {
      writeFile(audioFile + "message " + err.message, "./metadataErrors.txt");
      console.error(err.message);
    }
  }
  /* cb(filesWMetadata); */
};

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

const results = data => {
  scan(data, [], files => parseMeta(files));
};

const back = (roots, all = []) => {
  console.log(Date());
  if (!roots.length) return results(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  back(roots, all);
};

back([
  /*  "J:/S_Music",
    "I:/Music",
    "H:/Top/Music", */
  /* "F:/Music", */
  /* "D:/G_MUSIC", */
  "D:/music",
]);
