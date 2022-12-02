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

/* import { allIds } from "./update.js"; */
// ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
/* const db = new Database("./db/audiofiles.db", { verbose: console.log });
db.pragma("journal_mode = WAL"); */

/* const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "a" });
  file.on("error", err => console.log(err));
  file.write(data + "\n");

  file.end();
}; */

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
  const filesWithMetadata = async mdFiles => {
    insertFiles(mdFiles, ins => console.log(ins));
  };
  const xtractedFiles = (files, length) => {
    const dbFiles = getFiles();
    const dbAll = dbFiles.map(d => d.audioFile);

    const newEntries = files.filter(f => !dbAll.includes(f));
    const missingEntries = dbAll.filter(f => !files.includes(f));

    if (newEntries.length > 0) {
      parseMeta(newEntries, filesWithMetadata);
    }
    if (missingEntries.length > 0) {
      deleteFiles(missingEntries, d => console.log(d));
    }
  };
  scan(res, [], xtractedFiles);
};

const runFiles = (roots, all = []) => {
  if (!roots.length) return results(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  runFiles(roots, all);
};

const initFiles = () => runFiles(roots);

export default initFiles;
