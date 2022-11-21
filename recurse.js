import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { parseFile } from 'music-metadata';
import { parseFiles } from './metadata.js';

const eventEmitter = new EventEmitter();

class Track {
  constructor(file, title) {
    this.file = file;
    this.title = title;
  }
}

const writeFile = data => {
  console.log(data.length);
  const file = fs.createWriteStream('files-with-errors.txt', { flags: 'w+' });
  file.on('error', err => console.log(err));
  data.forEach(function (v) {
    file.write(v + '\n');
  });
  file.end();
};

/* const filesWMetadata = []; */

const displayFinal = result => {
  result.forEach(r => {
    console.log(r);
  });
};

const parseFiles = async (files, cb) => {
  for (const audioFile of files) {
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
  }
  cb(filesWMetadata);
};

const exts = ['.mp3', '.flac', '.ape', '.m4a', '.ogg'];

const recurse = (root, dirs, files = [], cb) => {
  if (!dirs.length) return cb(files, root);
  /* const root = 'J:S_Music'; */
  const next = dirs.shift();
  const folder = fs.readdirSync(`${root}/${next}`);
  const f = folder
    .filter(
      o =>
        fs.statSync(`${root}/${next}/${o}`).isFile() &&
        exts.includes(path.extname(`${root}/${next}/${o}`))
    )
    .map(el => `${root}/${next}/${el}`);
  const d = folder
    .filter(o => fs.statSync(`${root}/${next}/${o}`).isDirectory())
    .map(el => `${next}/${el}`);
  process.nextTick(() => recurse(root, [...dirs, ...d], [...files, ...f], cb));
};

const roots = [
  'J:S_Music',
  'I:/Music',
  'H:/Top/Music',
  'F:/Music',
  'D:/G_MUSIC',
  'D:/music',
];

const cb = (l, r) => console.log('length: ', l.length, 'root: ', r);
const run = () => {
  let all = [];
  let i = 0;
  roots.forEach(r => recurse(r, fs.readdirSync(r), [], cb));
};

run();
