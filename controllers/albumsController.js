import fs from "node:fs";
import { EventEmitter } from "node:events";
import { v4 as uuidv4 } from "uuid";
import { roots } from "../constant/constants.js";
import { insertAlbums, deleteAlbums, getAlbums } from "../sql.js";
const [...newroots] = roots;
const emitter = new EventEmitter();

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

  insertAlbums(albumsArr, emitter);
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const checkAgainstEntries = data => {
  /* const ce = dbEntries.all(); */
  const dbAlbums = getAlbums();
  const dbAlbumsFullpath = dbAlbums.map(album => album.fullpath);

  const allAlbums = new Set(data);
  const dbEntries = new Set(dbAlbumsFullpath);

  const newEntries = Array.from(difference(allAlbums, dbEntries));
  const missingEntries = Array.from(difference(dbEntries, allAlbums));

  if (newEntries.length > 0) {
    parseNewEntries(newEntries);
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries, emitter);
  } else if (!newEntries.length && !missingEntries.length) {
    emitter.emit("no changes", "no changes...");
  }
};

const runAlbums = (roots, all = []) => {
  if (!roots.length) return checkAgainstEntries(all);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  runAlbums(roots, all);
};

const initAlbums = () => {
  const [...newroots] = roots;
  runAlbums(roots);
  emitter.on("insert-albums-completed", inserted =>
    inserted.forEach(i => console.log(`Inserted: ${i.fullpath}`))
  );
  emitter.on("delete-albums-completed", deleted =>
    deleted.forEach(d => console.log(`Deleted: ${d}`))
  );
  emitter.on("no changes", x => console.log(x));
};

export default initAlbums;
