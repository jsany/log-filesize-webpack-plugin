import { tuple } from '@/helper/type';

export const knownTypes = tuple('js', 'css', 'image', 'font', 'json', 'txt', 'html');
export type TKnownType = typeof knownTypes[number];

export type TMimeMap = Record<TKnownType, string[]>;

const mimeMap: TMimeMap = {
  js: ['js'],
  css: ['css'],
  image: [
    'bmp',
    'jpg',
    'jpeg',
    'png',
    'tif',
    'gif',
    'pcx',
    'tga',
    'exif',
    'fpx',
    'svg',
    'psd',
    'cdr',
    'pcd',
    'dxf',
    'ufo',
    'eps',
    'ai',
    'raw',
    'WMF',
    'webp'
  ],
  json: ['json'],
  font: ['ttf', 'otf', 'ttc', 'woff2', 'eot'],
  txt: ['txt'],
  html: ['html']
};

export default mimeMap;
