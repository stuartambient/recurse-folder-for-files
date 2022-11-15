import fs from 'node:fs';
import { Buffer } from 'node:buffer';

const writeFile = data => {
  console.log(data.length);
  const file = fs.createWriteStream('files.txt');
  file.on('error', err => console.log(err));
  data.forEach(function (v) {
    file.write(v + '\n');
  });
  file.end();
};
const recurse = (dirs, files = []) => {
  if (!dirs.length) return writeFile(files);
  const root = 'D:/music';
  const next = dirs.shift();
  const folder = fs.readdirSync(`${root}/${next}`);
  const f = folder
    .filter(o => fs.statSync(`${root}/${next}/${o}`).isFile())
    .map(el => `${next}/${el}`);
  const d = folder
    .filter(o => fs.statSync(`${root}/${next}/${o}`).isDirectory())
    .map(el => `${next}/${el}`);
  process.nextTick(() => recurse([...dirs, ...d], [...files, ...f]));
};

recurse(fs.readdirSync('D:/music'));
