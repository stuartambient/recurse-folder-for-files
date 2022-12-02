import fs from "node:fs";
/* import Database from "better-sqlite3"; */
import { v4 as uuidv4 } from "uuid";
import { roots } from "../constant/constants.js";
import { insertAlbums, deleteAlbums, getAlbums } from "../sql.js";
const [...newroots] = roots;

const parseNewEntries = newEntries => {
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

  insertAlbums(albumsArr, res => console.log(res));
};

const checkAgainstEntries = data => {
  /* const ce = dbEntries.all(); */
  const currentEntries = getAlbums();
  const mappedCurrentEntries = currentEntries.map(dbe => dbe.fullpath);
  const newEntries = data.filter(n => !mappedCurrentEntries.includes(n));
  const missingEntries = mappedCurrentEntries.filter(x => !data.includes(x));
  if (newEntries.length > 0) {
    parseNewEntries(newEntries);
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries, res => console.log(res));
  } else if (!newEntries.length && !missingEntries.length) {
    console.log("nothing to change");
  }
};

const runAlbums = (roots, all = []) => {
  if (!roots.length) return checkAgainstEntries(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  runAlbums(roots, all);
};

const initAlbums = () => runAlbums(roots);

export default initAlbums;
