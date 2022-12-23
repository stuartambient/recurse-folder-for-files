import fs from "node:fs";
import path from "node:path";
/* import { Buffer } from "node:buffer"; */
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "music-metadata";

const parseMeta = async files => {
  const filesWMetadata = [];
  for (const audioFile of files) {
    const modified = fs.statSync(audioFile).mtimeMs;
    try {
      const metadata = await parseFile(audioFile);
      let { year, title, artist, album, genre, picture } = metadata.common;
      const { lossless, bitrate, sampleRate } = metadata.format;
      const afid = uuidv4();

      filesWMetadata.push({
        afid,
        audioFile,
        modified,
        extension: path.extname(audioFile),
        year,
        title,
        artist,
        album,
        genre: genre ? (genre = genre.join(",")) : null,
        picture: picture ? (picture = picture[0].data) : null,
        lossless: lossless === false ? 0 : 1,
        bitrate,
        sampleRate,
      });
    } catch (err) {
      writeFile(audioFile, "./metadataErrors.txt");
      fs.renameSync(`${audioFile}`, `${audioFile}.bad`);
      console.error(err);
    }
  }
  return filesWMetadata;
};

const writeFile = (data, filename) => {
  const file = fs.createWriteStream(filename, { flags: "a" });
  file.on("error", err => console.log(err));
  file.write(data + "\n");
  file.end();
};

export { parseMeta, writeFile };
