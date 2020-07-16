const { resolve } = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const LogFilesizeWebpackPlugin = require('../lib/index');

module.exports = {
  mode: process.env.NODE_ENV,
  // mode: 'production',
  entry: {
    index: resolve(__dirname, './src/index.js')
  },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'js/[name].[contenthash:6].js', // 入口文件命名
    chunkFilename: 'js/[name].[chunkhash:6].js' // 非入口文件命名
  },
  stats: 'none',
  
  resolve: {
    alias: {
      '@/': resolve(__dirname, './src/'),
    },
  },

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
                ],
                ['@babel/preset-react']
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
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer')({
                  overrideBrowserslist: ['last 10 versions']
                })
              ]
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|svga)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            // 需要下载file-loader和url-loader
            loader: 'url-loader',
            options: {
              limit: 5 * 1024, // 小于这个时将会已base64位图片打包处理
              // 图片文件输出的文件夹
              outputPath: 'images'
            }
          }
        ]
      },
      {
        test: /[\\.](woff2?|eot|ttf|otf)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
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
          name: 'commons',
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
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // 分离css
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[id].[name].[contenthash:6].css',
      chunkFilename: 'css/[id].[contenthash:6].css'
    }),
    new ManifestPlugin(),
    new LogFilesizeWebpackPlugin({ gzip: true })
  ]
};
