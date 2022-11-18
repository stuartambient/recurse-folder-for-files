import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { parseFile } from 'music-metadata';
import { parseFiles } from './metadata.js';

class Track {
  constructor(file, title) {
    this.file = file;
    this.title = title;
  }
}

const writeFile = data => {
  console.log(data.length);
  const file = fs.createWriteStream('files.txt');
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

/* const parseFiles = async (files, cb) => {
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
}; */

const DIRECTORIES = [
  'J:S_Music',
  'I:/Music',
  'H:/Top/Music',
  'F:/Music',
  'D:/G_MUSIC',
  'D:/music',
];

const exts = ['.mp3', '.flac', '.ape', '.m4a', '.ogg'];

const recurse = (dirs, files = []) => {
  if (!dirs.length) return parseFiles(files, displayFinal);
  const root = 'J:S_Music';
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
  process.nextTick(() => recurse([...dirs, ...d], [...files, ...f]));
};

recurse(fs.readdirSync('J:S_Music'));
