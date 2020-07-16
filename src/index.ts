import { Compiler, Stats } from 'webpack';
import { join, relative } from 'path';
import chalk from 'chalk';
import filesize from '@/helper/filesize'
import getGzippedSize from '@/helper/getGzippedSize'
import makeRow from '@/helper/makeRow'
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

const defaultOptions: IOptions = {
  gzip: true,
  errors: true,
  warnings: true,
  hash: true,
  version: true,
  time: true,
  builtAt: true,
  maxSize: 1.8 * 1024 * 1024
};

class LogFilesizeWebpackPlugin {
  private options: IOptions;

  public constructor(options = {} as IOptions) {
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

        if (isJS(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'z' + a.size;
        }
        if (isCSS(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'y' + a.size;
        }
        if (isIMAGE(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'x' + a.size;
        }
        if (isFONT(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'w' + a.size;
        }
        if (isJSON(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'v' + a.size;
        }
        if (isTXT(a.name)) {
          // @ts-ignore
          arr[i]['pos'] = 'u' + a.size;
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
        return b.pos < a.pos ? -1 : 1;
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
      `${ui.toString()}\n\n  ${chalk.gray(`Assets other than js, css, image, font, json, and txt are omitted.`)}\n`
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
