import { Compiler, Stats } from 'webpack';
import { join, relative } from 'path';
import chalk from 'chalk';
import filesize from '@/helper/filesize';
import getGzippedSize from '@/helper/getGzippedSize';
import makeRow from '@/helper/makeRow';
import { isJS, isCSS, isIMAGE, isFONT, isJSON, isTXT } from '@/helper/fileType';
const ui = require('cliui')({ with: 80 });

export interface IOptions {
  /* Switch log gzipped filesize */
  gzip?: boolean;
  /* Switch log compile errors */
  errors?: boolean;
  /* Switch log compile warnings */
  warnings?: boolean;
  /* Switch log current compile hash */
  hash?: boolean;
  /* Switch log current webpack version */
  version?: boolean;
  /* Switch log compile cost time */
  time?: boolean;
  /* Switch log when to start compiling */
  builtAt?: boolean;
  /* These js sizes are pretty large. We'll warn for bundles exceeding them. */
  maxSize: number;
}
export interface IStatus {
  msg: 'success' | 'error' | 'norun';
  data: any;
}

const getKnownType = (val: string) => {
  if (isJS(val)) return 'js';
  if (isCSS(val)) return 'css';
  if (isIMAGE(val)) return 'image';
  if (isFONT(val)) return 'font';
  if (isJSON(val)) return 'json';
  if (isTXT(val)) return 'txt';
  // return void 0;
  return undefined;
};

class LogFilesizeWebpackPlugin {
  public static defaultOptions: IOptions = {
    gzip: true,
    errors: true,
    warnings: true,
    hash: true,
    version: true,
    time: true,
    builtAt: true,
    maxSize: 1.8 * 1024 * 1024
  };
  public options: IOptions;

  public status: IStatus;

  public constructor(options = {} as IOptions) {
    this.options = this.mergeOptions(options, LogFilesizeWebpackPlugin.defaultOptions);
    this.status = { msg: 'norun', data: 'printfStats havent run' };
  }
  public apply = (compiler: Compiler) => {
    compiler.hooks.afterEmit.tap('LogFilesizeWebpackPlugin', (compilation) => {
      // TODO: use file.type(MIME) instead of regexp
    });
    compiler.hooks.done.tap('LogFilesizeWebpackPlugin', (stats) => {
      // console.log('===== done =====');
      // console.log(stats);
      // console.log('===== done =====');
      this.printfStats(stats);
    });
  };

  public printfStats = (stats: Stats) => {
    try {
      const json = stats.toJson({
        modules: false,
        chunks: false
      });
      // console.log('===== printfStats =====');
      // console.log(json);
      // console.log('===== printfStats =====');
      const dir = relative(process.cwd(), json.outputPath || '');
      const assets = json.assets
        ? json.assets
        : // @ts-ignore
          json?.children?.reduce((acc, child) => acc.concat(child?.assets), []);

      const seenNames = new Map();

      const orderedAssets = assets
        ?.map((a) => {
          a.name = a.name.split('?')[0];
          // These sizes are pretty large
          const maxRecommendedSize = this.options.maxSize;
          const isLarge = maxRecommendedSize && a.size > maxRecommendedSize;
          return {
            ...a,
            suggested: isLarge && isJS(a.name)
          };
        })
        .filter((a, i, arr) => {
          if (seenNames.has(a.name)) {
            return false;
          }
          seenNames.set(a.name, true);

          switch (getKnownType(a.name)) {
            case 'js':
              // @ts-ignore
              arr[i]['pos'] = 6e10 + a.size;
              break;
            case 'css':
              // @ts-ignore
              arr[i]['pos'] = 5e10 + a.size;
              break;
            case 'image':
              // @ts-ignore
              arr[i]['pos'] = 4e10 + a.size;
              break;
            case 'font':
              // @ts-ignore
              arr[i]['pos'] = 3e10 + a.size;
              break;
            case 'json':
              // @ts-ignore
              arr[i]['pos'] = 2e10 + a.size;
              break;
            case 'txt':
              // @ts-ignore
              arr[i]['pos'] = 1e10 + a.size;
              break;
            default:
              break;
          }

          const isKnown =
            isJS(a.name) ||
            isCSS(a.name) ||
            isIMAGE(a.name) ||
            isFONT(a.name) ||
            isJSON(a.name) ||
            isTXT(a.name);
          return isKnown;
        })
        .sort((a, b) => {
          // @ts-ignore
          return b.pos - a.pos;
        });

      // console.log('== orderedAssets ==')
      // console.log(orderedAssets)
      // console.log('== orderedAssets ==')

      if (this.options.errors && json.errors.length) {
        ui.div(chalk.red.bold('Error: ') + '\n' + chalk.red(json.errors.join('\n')));
        ui.div('\n');
      }
      if (this.options.warnings && json.warnings.length) {
        ui.div(chalk.yellow.bold('Warning: ') + '\n' + chalk.yellow(json.warnings.join('\n')));
        ui.div('\n');
      }
      if (this.options.version) {
        ui.div(chalk.white.bold('Version: ') + chalk.white('webpack ' + json.version));
      }
      if (this.options.hash) {
        ui.div(chalk.white.bold('Hash: ') + chalk.white(json.hash));
      }
      if (this.options.time) {
        ui.div(chalk.white.bold('Time: ') + chalk.white(json.time + 'ms'));
      }
      if (this.options.builtAt) {
        ui.div(chalk.white.bold('Built At: ') + chalk.white(new Date(json.builtAt!)));
      }
      ui.div('\n');
      ui.div(
        makeRow(
          chalk.cyan.bold(`File`),
          chalk.cyan.bold(`Size`),
          (this.options.gzip && chalk.cyan.bold(`Gzipped`)) || ''
        ) +
          `\n\n` +
          orderedAssets
            ?.map((asset) => {
              let row1 = join(dir, asset.name);
              const row2 = filesize(asset.size);
              const row3 = (this.options.gzip && getGzippedSize(asset, dir)) || '';
              if (isJS(asset.name)) {
                row1 = asset.suggested ? chalk.yellow(row1) : chalk.green(row1);
              }
              if (isCSS(asset.name)) {
                row1 = chalk.blue(row1);
              }
              if (isIMAGE(asset.name)) {
                row1 = chalk.magenta(row1);
              }
              if (isFONT(asset.name)) {
                row1 = chalk.cyan(row1);
              }
              if (isJSON(asset.name)) {
                row1 = chalk.gray(row1);
              }
              if (isTXT(asset.name)) {
                row1 = chalk.white(row1);
              }
              return makeRow(row1, row2, row3);
            })
            .join(`\n`)
      );
      console.log(
        `${ui.toString()}\n\n  ${chalk.gray.inverse(
          `🚨 Assets other than js, css, image, font, json, and txt are omitted.`
        )}\n`
      );
      if (orderedAssets?.some((asset) => asset.suggested)) {
        console.log(chalk.yellow('The bundle size is significantly larger than recommended.'));
        console.log(
          chalk.yellow(
            'Consider reducing it with code splitting: https://v4.webpack.docschina.org/guides/code-splitting/'
          )
        );
      }
      this.status = { msg: 'success', data: orderedAssets };
    } catch (err) {
      this.status = { msg: 'error', data: err };
      throw new Error(err);
    }
  };

  public mergeOptions = (options: IOptions, defaults: IOptions): IOptions => {
    try {
      for (const key in defaults) {
        if (options.hasOwnProperty(key)) {
          (defaults as any)[key] = (options as any)[key];
        }
      }
      return defaults;
    } catch (err) {
      throw new Error(err);
    }
  };
}

// to generate type definitions
export default LogFilesizeWebpackPlugin;
// to support CommonJS
module.exports = LogFilesizeWebpackPlugin;
// to support ES6 default import
module.exports.default = module.exports;
