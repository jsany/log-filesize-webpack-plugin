import { Compiler, Stats } from 'webpack';
import { join, resolve, relative } from 'path';
import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import zlib from 'zlib';
const ui = require('cliui')({ with: 80 });

export interface IOptions {

  /* Switch log gzip */
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
  /* These sizes are pretty large. We'll warn for bundles exceeding them. */
  maxSize: number;

}

const defaultOptions: IOptions = {
  gzip: true,
  errors: true,
  warnings: true,
  hash: true,
  version: true,
  time: true,
  builtAt: true,
  maxSize: 1.8 * 1024 * 1024,
};

const filesize = (bytes: number) => {
  bytes = Math.abs(bytes);
  const radix = 1024;
  const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let loop = 0;

  // calculate
  while (bytes >= radix) {
    bytes /= radix;
    ++loop;
  }
  return `${bytes.toFixed(1)} ${unit[loop]}`;
};
const getGzippedSize = (asset: any, dir: string) => {
  const filepath = resolve(join(dir, asset.name));
  if (existsSync(filepath)) {
    const buffer = readFileSync(filepath);
    return filesize(zlib.gzipSync(buffer).length);
  }
  return filesize(0);
};

const makeRow = (a: string, b: string, c: string): string => {
  return ` ${a}\t      ${b}\t ${c}`;
};
class LogFilesizeWebpackPlugin {
  private options: IOptions;

  public constructor(options: IOptions) {
    this.options = this.mergeOptions(options, defaultOptions);
  }
  public apply = (compiler: Compiler) => {
    compiler.hooks.done.tap('LogFilesizeWebpackPlugin', (stats) => {
      // console.log('===== done =====');
      // console.log(stats);
      // console.log('===== done =====');
      this.printfStats(stats);
    });
  };

  private printfStats = (stats: Stats) => {
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
    const isJS = (val: string) => /\.js$/.test(val);
    const isCSS = (val: string) => /\.css$/.test(val);

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
      .filter((a) => {
        if (seenNames.has(a.name)) {
          return false;
        }
        seenNames.set(a.name, true);
        return isJS(a.name) || isCSS(a.name);
      })
      .sort((a, b) => {
        if (isJS(a.name) && isCSS(b.name)) return -1;
        if (isCSS(a.name) && isJS(b.name)) return 1;
        return b.size - a.size;
      });

    if (this.options.errors && json.errors.length) {
      ui.div(chalk.red('Error: ') + '\n' + json.errors.join('\n'));
    }
    if (this.options.warnings && json.warnings.length) {
      ui.div(chalk.yellow('Warning: ') + '\n' + json.warnings.join('\n'));
    }
    if (this.options.version) {
      ui.div(chalk.white('Version: webpack ') + json.version);
    }
    if (this.options.hash) {
      ui.div(chalk.white('Hash: ') + json.hash);
    }
    if (this.options.time) {
      ui.div(chalk.white('Time: ') + json.time + 'ms');
    }
    if (this.options.builtAt) {
      ui.div(chalk.white('Built At: ') + new Date(json.builtAt!));
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
          ?.map((asset) =>
            makeRow(
              /js$/.test(asset.name)
                ? asset.suggested
                  ? // warning for large bundle
                    chalk.yellow(join(dir, asset.name))
                  : chalk.green(join(dir, asset.name))
                : chalk.blue(join(dir, asset.name)),
              filesize(asset.size),
              (this.options.gzip && getGzippedSize(asset, dir)) || ''
            )
          )
          .join(`\n`)
    );
    console.log(
      `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of assets omitted.`)}\n`
    );
    if (orderedAssets?.some((asset) => asset.suggested)) {
      console.log();
      console.log(chalk.yellow('The bundle size is significantly larger than recommended.'));
      console.log(
        chalk.yellow(
          'Consider reducing it with code splitting: https://v4.webpack.docschina.org/guides/code-splitting/'
        )
      );
      console.log();
    }
  };

  private mergeOptions = (options: IOptions, defaults: IOptions): IOptions => {
    for (const key in defaults) {
      if (options.hasOwnProperty(key)) {
        (defaults as any)[key] = (options as any)[key];
      }
    }
    return defaults;
  };
}

// to generate type definitions
export default LogFilesizeWebpackPlugin;
// to support CommonJS
module.exports = LogFilesizeWebpackPlugin;
// to support ES6 default import
module.exports.default = module.exports;
