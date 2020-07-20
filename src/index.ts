import { Compiler, Stats } from 'webpack';
import { join, relative } from 'path';
import chalk from 'chalk';
import filesize from '@/helper/filesize';
import getGzippedSize from '@/helper/getGzippedSize';
import makeRow from '@/helper/makeRow';
const ui = require('cliui')({ with: 80 });
import mime from '@/helper/definedMime';
import { TKnownType, knownTypes } from '@/helper/mimeMap';

export type TPriority = Partial<Record<TKnownType, number>>;
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
  /* The larger the value, the higher the sort, and hide if less than zero */
  priority?: TPriority;
}
export interface IStatus {
  msg: 'success' | 'error' | 'norun';
  data: any;
}

export interface IAssetMeta {
  name: string;
  type: TKnownType;
  size: number;

  gzipped?: number;

  suggested?: boolean;
  priority?: number;
}

class LogFilesizeWebpackPlugin {
  public static defaultOptions: IOptions = {
    gzip: true,
    errors: true,
    warnings: true,
    hash: true,
    version: true,
    time: true,
    builtAt: true,
    maxSize: 1.8 * 1024 * 1024,
    priority: {
      js: 10,
      css: 9,
      image: 8,
      font: 7,
      json: 6,
      txt: 5,
      html: 4
    }
  };
  public options: IOptions;

  public status: IStatus;
  public assetsCache: IAssetMeta[];

  public constructor(options = {} as IOptions) {
    this.options = this.mergeOptions(options, LogFilesizeWebpackPlugin.defaultOptions);
    this.status = { msg: 'norun', data: 'printfStats havent run' };
    this.assetsCache = [];
  }
  public apply = (compiler: Compiler) => {
    compiler.hooks.afterEmit.tap('LogFilesizeWebpackPlugin', (compilation) => {
      // DONE: use file.type(MIME) instead of regexp
      // console.log('===== compilation =====');
      const { assets } = compilation;
      const seenNames = new Map();
      this.assetsCache = Object.keys(assets)
        .filter((item) => {
          if (seenNames.has(item)) {
            return false;
          }
          seenNames.set(item, true);
          const type = mime.getType(item) as TKnownType;
          const priority = this.options.priority?.[type];
          return knownTypes.includes(type) && priority! > 0;
        })
        .map((item) => {
          const source = assets[item].source();
          const name = item;
          const type = mime.getType(name) as TKnownType;
          const size = assets[item].size() as number;
          const gzipped = (this.options.gzip && getGzippedSize(source)) || undefined;
          const priority = this.options.priority?.[type];
          const isLarge = size > this.options.maxSize;

          return { name, type, size, gzipped, priority, suggested: isLarge && type === 'js' };
        })
        .sort((a, b) => {
          if (a.type === b.type) {
            return b.size - a.size;
          } else {
            return b.priority! - a.priority!;
          }
        });
      // console.log('===== compilation =====');
    });
    compiler.hooks.done.tap('LogFilesizeWebpackPlugin', (stats) => {
      // console.log('===== done =====');
      // // console.log(stats);
      // // console.log(this.assetsCache)
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
          this.assetsCache
            ?.map((asset) => {
              let row1 = join(dir, asset.name);
              const row2 = filesize(asset.size);
              const row3 = (this.options.gzip && filesize(asset.gzipped!)) || '';
              switch (asset.type) {
                case 'js':
                  row1 = asset.suggested ? chalk.yellow(row1) : chalk.green(row1);
                  break;
                case 'css':
                  row1 = chalk.blue(row1);
                  break;
                case 'image':
                  row1 = chalk.magenta(row1);
                  break;
                case 'font':
                  row1 = chalk.cyan(row1);
                  break;
                case 'json':
                  row1 = chalk.gray(row1);
                  break;
                case 'txt':
                  row1 = chalk.white(row1);
                  break;
                case 'html':
                  row1 = chalk.red(row1);
                  break;
                default:
                  break;
              }
              return makeRow(row1, row2, row3);
            })
            .join(`\n`)
      );
      console.log(
        `${ui.toString()}\n\n  ${chalk.gray.inverse(
          `🚨 Assets other than ${knownTypes.slice(0, -1).join(', ')} and ${knownTypes.slice(
            -1
          )} are omitted.`
        )}\n`
      );
      if (this.assetsCache?.some((asset) => asset.suggested)) {
        console.log(chalk.yellow('The bundle size is significantly larger than recommended.'));
        console.log(
          chalk.yellow(
            'Consider reducing it with code splitting: https://v4.webpack.docschina.org/guides/code-splitting/'
          )
        );
      }
      this.status = { msg: 'success', data: this.assetsCache };
    } catch (err) {
      this.status = { msg: 'error', data: err };
      throw new Error(err);
    }
  };

  public mergeOptions = (options: IOptions, defaults: IOptions): IOptions => {
    try {
      const { priority: optionsPriority, ...optionsRest } = options;
      const { priority: defaultPriority, ...defaultRest } = defaults;

      Object.assign(defaultPriority, optionsPriority);
      Object.assign(defaultRest, optionsRest, { priority: defaultPriority });
      // console.log('===== defaultRest =====');
      // console.log(defaultRest)
      // console.log('===== defaultRest =====');
      return defaultRest;
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
