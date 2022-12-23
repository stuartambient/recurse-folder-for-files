import { promises as fs } from "fs";
import { parseFile } from "music-metadata";
import { basename } from "path";

const dir = process.argv[2];

const mmStream = async () => {
  console.log(dir);
  try {
    const files = await fs.readdir(dir);
    for (const file of files) console.log(`${dir}/${file}`);
  } catch (err) {
    console.log(err.message);
  }
};

mmStream();
