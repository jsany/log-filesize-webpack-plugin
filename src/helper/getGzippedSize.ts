import zlib from 'zlib';

export default (buffer: Buffer) => {
  return zlib.gzipSync(buffer).length;
};
