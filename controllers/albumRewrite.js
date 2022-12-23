/* import fs from "node:fs"; */
import { dir } from "node:console";
import { promises as fsPromises } from "node:fs";
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

  insertAlbums(albumsArr);
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const checkAgainstEntries = data => {
  let status = { deleted: 0, new: 0, nochange: false };
  const dbAlbums = getAlbums();
  const dbAlbumsFullpath = dbAlbums.map(album => album.fullpath);

  const allAlbums = new Set(data);
  const dbEntries = new Set(dbAlbumsFullpath);

  const newEntries = Array.from(difference(allAlbums, dbEntries));
  const missingEntries = Array.from(difference(dbEntries, allAlbums));

  if (newEntries.length > 0) {
    parseNewEntries(newEntries);
    status.new = newEntries;
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries);
    status.deleted = missingEntries;
  } else if (!newEntries.length && !missingEntries.length) {
    /* cb(["no changes"]); */
    status.nochange = true;
  }
  return status;
};

const runAlbums = async (roots, all = []) => {
  if (!roots.length)
    return (
      Promise.resolve(all)
        /* .then(r => checkAgainstEntries(r)) */
        .then(result => checkAgainstEntries(result))
        .then(status => console.log(status))
    );

  const root = roots.shift();
  const dirs = fsPromises
    .readdir(root)
    .then(rfs => rfs.map(r => `${root}/${r}`))
    .then(r => all.push(...r))
    .then(() => runAlbums(roots, all));
};

const initAlbums = async () => {
  const [...newroots] = roots;
  runAlbums(newroots);
};

export default initAlbums;
