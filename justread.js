import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import { parseFile } from 'music-metadata';
import client from './db/index.js';

/* console.log(client); */

const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: 'w+' });
  file.on('error', err => console.log(err));
  if (Array.isArray(data)) {
    data.forEach(function (v) {
      file.write(v + '\n');
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

      filesWMetadata.push({
        file: audioFile,
        year,
        title,
        artist,
        album,
        genre,
        picture,
        lossless,
        bitrate,
        sampleRate,
      });
    } catch (err) {
      /* writeFile(audioFile, err); */
      console.error(err);
    }
  }
  cb(filesWMetadata, filesWMetadata.length);
};

const playlistFiles = [
  '.m3u',
  '.PLS',
  '.XSPF',
  '.WVX',
  '.CONF',
  '.ASX,',
  '.IFO,',
  '.CUE',
];
const audioFiles = ['.mp3', '.flac', '.ape', '.m4a', '.ogg'];

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
  const filesWithMetadata = async (wMeta, length) => {
    try {
      await client.connect();
      const database = client.db('library');
      const audioFiles = database.collection('audiofiles');
      const options = { ordered: true };
      const result = await audioFiles.insertMany(wMeta, options);
      console.log(`${result.insertedCount} documents were inserted`);
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
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
  /* 'J:S_Music', */
  'I:/Music',
  'H:/Top/Music',
  'F:/Music',
  /* 'D:/G_MUSIC',
  'D:/music', */
]);
