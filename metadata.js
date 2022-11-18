import { parseFile } from 'music-metadata';

export const parseFiles = async (files, cb) => {
  const filesWMetadata = [];

  for (const audioFile of files) {
    const metadata = await parseFile(audioFile);
    const { year, title, artist, album, genre, picture } = metadata.common;
    const { lossless, bitrate, sampleRate } = metadata.format;

    filesWMetadata.push({
      file: audioFile,
      year,
      title,
      artist,
      album,
      genre,
      picture,
      lossless,
      bitrate,
      sampleRate,
    });
  }
  cb(filesWMetadata);
};
