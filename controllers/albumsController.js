import { promises as fsPromises } from "node:fs";
import { v4 as uuidv4 } from "uuid";
import fg from "fast-glob";
import { roots } from "../constant/constants.js";
import { insertAlbums, deleteAlbums, getAlbums } from "../sql.js";
const [...newroots] = roots;

const parseNewEntries = newEntries => {
  const newAlbums = [];

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
    newAlbums.push({ _id, root, name, fullpath });
  }
  return newAlbums;
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const checkAgainstEntries = data => {
  return new Promise((resolve, reject) => {
    let status = { deleted: 0, new: 0, nochange: false };
    const dbAlbums = getAlbums();
    const dbAlbumsFullpath = dbAlbums.map(album => album.fullpath);

    const allAlbums = new Set(data);
    const dbEntries = new Set(dbAlbumsFullpath);

    const newEntries = Array.from(difference(allAlbums, dbEntries));
    const missingEntries = Array.from(difference(dbEntries, allAlbums));

    if (newEntries.length > 0) {
      status.new = newEntries;
    }
    if (missingEntries.length > 0) {
      status.deleted = missingEntries;
    }
    if (!newEntries.length && !missingEntries.length) {
      status.nochange = true;
    }
    return resolve(status);
  });
};

/* const runAlbums = async (roots, all = [], cb) => {
  if (!roots.length)
    return (
      Promise.resolve(all)
        /* .then(r => checkAgainstEntries(r)) */
/* .then(checkAgainstEntries)
        .then(status => {
          if (status.deleted) {
            deleteAlbums(status.deleted);
          }
          if (status.new) {
            const parsed = parseNewEntries(status.new);
            insertAlbums(parsed);
          }
          return cb(status);
        })
    ); */

/*   const root = roots.shift();
  const dirs = fsPromises
    .readdir(root)
    .then(rfs => rfs.map(r => `${root}/${r}`))
    .then(r => all.push(...r))
    .then(() => runAlbums(roots, all, cb));
};  */

const glob = patterns => {
  console.log(patterns);
  const entries = fg.sync(patterns);
  return entries;
};

const runAlbums = roots => {
  const patterns = roots.map(root => `${root}/**, {onlyDirectories: true}`);
  /* await fg(patterns).then(entries => console.log(entries)); */
  const albums = glob(patterns);
  console.log(albums);
};

const initAlbums = async () => {
  const roots = [
    "J:/S_Music",
    "I:/Music",
    "H:/Top/Music",
    "F:/Music",
    "D:/G_MUSIC",
    "D:/music",
  ];
  runAlbums(roots, [], result => console.log(result));
};

export default initAlbums;
