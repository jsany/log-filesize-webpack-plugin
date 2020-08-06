import { resolve } from 'path';
import webpack, { Configuration } from 'webpack';
import pkg from 'webpack/package.json';
import LogFilesizeWebpackPlugin from '../lib/index';
const baseConfig = require('./support/webpack.base.conf');

const webpackMajorVersion = Number(pkg.version.split('.')[0]);

if (isNaN(webpackMajorVersion)) {
  throw new Error('Cannot parse webpack major version');
}
const OUTPUT_DIR = resolve(__dirname, '../dist/basic-test');

const testLogFilesizePlugin = (
  webpackConfig: Configuration,
  pluginInstance: any,
  done: Function
) => {
  // console.log(webpackConfig)
  webpack(webpackConfig, (err, stats) => {
    expect(err).toBeFalsy();
    const compilationErrors = (stats.compilation.errors || []).join('\n');
    const compilationWarnings = (stats.compilation.warnings || []).join('\n');
    expect(compilationErrors).toBe('');
    expect(compilationWarnings).toBe('');
    expect(pluginInstance.status.msg).toBe('success');
    // console.info(pluginInstance.status)
    done();
  });
};

const customOptions = {
  version: false,
  maxSize: 0.1 * 1024 * 1024
};

const log = new LogFilesizeWebpackPlugin(customOptions);

describe('LogFilesizeWebpackPlugin', () => {
  it('shoule be mergeOptions', (done) => {
    const customOptions = {
      version: false,
      maxSize: 0.1 * 1024 * 1024
    };
    // console.log(log.options)
    // console.log({ ...LogFilesizeWebpackPlugin.defaultOptions, ...customOptions })
    expect(log.options).toMatchObject({
      ...LogFilesizeWebpackPlugin.defaultOptions,
      ...customOptions
    });
    done();
  });

  it('shoule be printfStats', (done) => {
    const config = { ...baseConfig } as Configuration;
    // @ts-ignore
    config.entry = {
      index1: resolve(__dirname, './fixtures/index1.tsx'),
      index2: resolve(__dirname, './fixtures/index2.tsx')
    };
    // @ts-ignore
    config.output = {
      path: OUTPUT_DIR,
      filename: 'js/[name].[chunkhash:6].js',
      chunkFilename: 'js/[name].[chunkhash:6].js'
    };
    config.plugins!.push(log);
    testLogFilesizePlugin(config, log, done);
  });
});
