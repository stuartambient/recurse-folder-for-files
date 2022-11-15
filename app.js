/* FOLDER FUNCTION FROM MUSICLIBRARY */
const fs = require('fs');
const p = require('path');
const mm = require('music-metadata');
class Folder {
  constructor(path, root, name, created) {
    this.path = path;
    this.root = root;
    this.name = name;
    this.created = created;
    this.files = [] || null;
    this.subdirectories = [] || null;
  }

  async metadata(file) {
    try {
      const metaTmp = await mm.parseFile(file);

      return {
        file,
        ext: p.extname(file),
        artist: metaTmp.common.artist,
        album: metaTmp.common.album,
        title: metaTmp.common.title,
        artists: metaTmp.common.artists,
        genre: metaTmp.common.genre,
      };
    } catch (err) {
      return;
    }
  }

  async isAudioExt(file) {
    const exts = ['.mp3', '.flac', '.ape', '.m4a', '.ogg'];
    if (exts.includes(p.extname(file))) {
      return await this.metadata(file);
    }
    return { file, ext: p.extname(file) };
  }

  async getMeta(path, file) {
    return Promise.all(file.map(f => this.isAudioExt(`${path}/${f}`))).catch(
      error => console.error(error)
    );
  }

  async scan(path, prev) {
    const isFile = fs.statSync(path);

    let dir = '';
    if (prev) {
      dir = prev;
    } else {
      dir = fs.readdirSync(path);
    }

    const d = dir.shift();

    if (d === undefined) return; //this.files.push();
    const stats = fs.statSync(`${path}/${d}`);

    const sub = `${path}/${d}`;

    if (!stats.isDirectory()) {
      const metadata = await this.isAudioExt(sub);
      this.files.push(metadata);
    } else {
      const checkfiles = fs.readdirSync(sub);
      const files = checkfiles.filter(e => fs.statSync(`${sub}/${e}`).isFile());

      const diff = checkfiles.filter(x => !files.includes(x));
      const dirFiles = await this.getMeta(sub, files);

      this.subdirectories.push({ directory: sub, dirFiles });
      if (diff.length > 0) await this.scan(sub, diff);
    }

    if (dir.length < 1) {
      return;
    }

    await this.scan(path, dir);
  }
}

async function init(path) {
  const created = fs.statSync(path);
  const strippath = path.split('/');

  const name = strippath.pop();
  const root = strippath.join('/');
  const folder = new Folder(path, root, name, created.birthtime);
  await folder.scan(path);
  if (folder.subdirectories.length <= 0) {
    delete folder.subdirectories;
  }
  console.log(folder);
}

init('J:/S_Music');

/* const topFolder = () => {
  const dir = fs.readdirSync('J:/S_Music');
};

topFolder();
 */
