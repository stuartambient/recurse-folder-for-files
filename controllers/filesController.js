import fs from "node:fs";
import { EventEmitter } from "node:events";
import path from "node:path";
import { parseMeta } from "../utility/index.js";
import { v4 as uuidv4 } from "uuid";
import {
  roots,
  playlistExtensions,
  audioExtensions,
} from "../constant/constants.js";
import { getFiles, insertFiles, deleteFiles } from "../sql.js";

const filesWithMetadata = async mdFiles => {
  insertFiles(mdFiles);
};

const compareDb2Filelist = files => {
  const dbFiles = getFiles();
  const dbAll = dbFiles.map(d => d.audioFile);

  const newEntries = files.filter(f => !dbAll.includes(f));
  const missingEntries = dbAll.filter(f => !files.includes(f));

  if (newEntries.length > 0) {
    parseMeta(newEntries, filesWithMetadata);
  }
  if (missingEntries.length > 0) {
    deleteFiles(missingEntries);
  }
};

const scan = (dirs, files = [], compareDb2Filelist) => {
  if (!dirs.length) return compareDb2Filelist(files.sort());

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
  process.nextTick(() =>
    scan([...dirs, ...d], [...files, ...f], compareDb2Filelist)
  );
};

const runFiles = (roots, alldirectories = []) => {
  if (!roots.length) return scan(alldirectories, [], compareDb2Filelist);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  alldirectories.push(...dirs);
  runFiles(roots, alldirectories);
};

const initFiles = () => {
  const [...newroots] = roots;
  runFiles(newroots);
};

export default initFiles;
