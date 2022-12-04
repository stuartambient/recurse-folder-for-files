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
const emitter = new EventEmitter();

const filesWithMetadata = async mdFiles => {
  insertFiles(mdFiles, emitter);
};
const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const compareDb2Filelist = files => {
  const dbFiles = getFiles();
  const dbAll = dbFiles.map(d => d.audioFile);

  const allfiles = new Set(files);
  const dbentries = new Set(dbAll);

  const newEntries = Array.from(difference(allfiles, dbentries));
  const missingEntries = Array.from(difference(dbentries, allfiles));

  /*   const newEntries = files.filter(f => !dbAll.includes(f));
  const missingEntries = dbAll.filter(f => !files.includes(f));
  */

  if (newEntries.length > 0) {
    parseMeta(newEntries, filesWithMetadata);
  }
  if (missingEntries.length > 0) {
    deleteFiles(missingEntries, emitter);
  } else if (!newEntries.length && !missingEntries.length) {
    emitter.emit("no changes", "no changes...");
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

const initFiles = async () => {
  const [...newroots] = roots;

  runFiles(newroots);
  emitter.on("insert-files-completed", inserted =>
    inserted.forEach(i => console.log(`Inserted: ${i.audioFile}`))
  );
  emitter.on("delete-files-completed", deleted =>
    deleted.forEach(d => console.log(`Deleted: ${d}`))
  );
  emitter.on("no changes", x => console.log(x));
};

export default initFiles;
