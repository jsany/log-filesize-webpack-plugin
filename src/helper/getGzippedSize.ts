import { existsSync, readFileSync } from 'fs';
import zlib from 'zlib';
import { join, resolve } from 'path';
import filesize from '@/helper/filesize';

export default (asset: any, dir: string) => {
  const filepath = resolve(join(dir, asset.name));
  if (existsSync(filepath)) {
    const buffer = readFileSync(filepath);
    return filesize(zlib.gzipSync(buffer).length);
  }
  return filesize(0);
};