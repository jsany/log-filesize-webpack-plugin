const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack')
const LogFilesizeWebpackPlugin = require('../lib/index');

module.exports = {
  mode: process.env.NODE_ENV,
  // mode: 'production',
  entry: {
    index: resolve(__dirname, './src/index.js')
  },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].[contenthash:6].js', // 入口文件命名
    chunkFilename: '[name].[chunkhash:6].js', // 非入口文件命名
  },
  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.js$/,
        include: resolve(__dirname, './src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: '30',
                      ie: '8',
                      android: '4'
                    },
                    useBuiltIns: 'entry',
                    corejs: 3
                  }
                ]
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import'
              ]
            }
          }
        ]
      }
    ]
  },

  // 提取公共代码
  optimization: {
    runtimeChunk: { name: 'manifest' },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        common: {
          // 抽离自己写的公共代码
          name:'commons',
          chunks: 'all',
          minSize: 0, // 只要超出0字节就生成一个新包
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    // 删除 dist 目录
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new LogFilesizeWebpackPlugin({ gzip: true })
  ]
};
