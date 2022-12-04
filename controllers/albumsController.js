import fs from "node:fs";
/* import Database from "better-sqlite3"; */
import { v4 as uuidv4 } from "uuid";
import { roots } from "../constant/constants.js";
import { insertAlbums, deleteAlbums, getAlbums } from "../sql.js";
const [...newroots] = roots;

const parseNewEntries = (newEntries, cb) => {
  const albumsArr = [];

  for (const entry of newEntries) {
    const _id = uuidv4();
    let name, root, fullpath;

    for (const r of newroots) {
      if (entry.startsWith(r)) {
        const newStr = entry.replace(`${r}/`, "");
        root = r;
        name = newStr;
      }
      const _id = uuidv4();
      fullpath = entry;
    }
    albumsArr.push({ _id, root, name, fullpath });
  }

  insertAlbums(albumsArr, cb);
};

const checkAgainstEntries = (data, cb) => {
  /* const ce = dbEntries.all(); */
  const currentEntries = getAlbums();
  const mappedCurrentEntries = currentEntries.map(dbe => dbe.fullpath);
  const newEntries = data.filter(n => !mappedCurrentEntries.includes(n));
  const missingEntries = mappedCurrentEntries.filter(x => !data.includes(x));
  if (newEntries.length > 0) {
    parseNewEntries(newEntries, cb);
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries, cb);
  } else if (!newEntries.length && !missingEntries.length) {
    cb("nothing to change");
  }
};

const runAlbums = (roots, all = [], cb) => {
  if (!roots.length) return checkAgainstEntries(all, cb);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  runAlbums(roots, all, cb);
};

const initAlbums = () => {
  const endResults = r => console.log("end results: ", r);
  runAlbums(roots, [], endResults);
};

export default initAlbums;
