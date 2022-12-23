import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { parseMeta } from "../utility/index.js";
import { v4 as uuidv4 } from "uuid";
import {
  roots,
  playlistExtensions,
  audioExtensions,
  fileExtensions,
} from "../constant/constants.js";
import { getFiles, insertFiles, deleteFiles } from "../sql.js";

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const compareDbRecords = async files => {
  const status = { new: "", missing: "", nochange: false };
  const dbFiles = getFiles();
  const dbAll = dbFiles.map(d => d.audioFile);

  const allfiles = new Set(files);
  const dbentries = new Set(dbAll);

  const newEntries = Array.from(difference(allfiles, dbentries));
  const missingEntries = Array.from(difference(dbentries, allfiles));

  if (newEntries.length > 0) {
    await parseMeta(newEntries)
      .then(parsed => insertFiles(parsed))
      .then(() => (status.new = newEntries));
  }
  if (missingEntries.length > 0) {
    deleteFiles(missingEntries);
    status.missing = missingEntries;
  } else {
    status.nochange = true;
  }
  return status;
};

const glob = async patterns => {
  const entries = await fg(patterns);
  /* compareDbRecords(entries); */
  return entries;
};

const runFiles = async roots => {
  const patterns = roots.map(root => `${root}/**/*.${fileExtensions}`);
  await glob(patterns)
    .then(allfiles => compareDbRecords(allfiles))
    .then(prepared => console.log(prepared));
};

const initFiles = async () => {
  const [...newroots] = roots;
  runFiles(newroots);
};

export default initFiles;
