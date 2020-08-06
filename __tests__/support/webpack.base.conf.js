const { resolve } = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const config = (module.exports = {
  mode: 'development',
  stats: 'none',
  resolve: {
    alias: {
      '@': resolve(__dirname, '../fixtures')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /[\\.]js(x?)$/,
        include: resolve(__dirname, '../fixtures'),
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
        test: /[\\.]ts(x?)$/,
        include: resolve(__dirname, '../fixtures'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
            }
          }
        ]
      },
      {
        test: /[\\.](le|c)ss$/,
        include: resolve(__dirname, '../fixtures'),
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
        test: /[\\.](png|jpg|jpeg|gif|svg|svga)$/,
        include: resolve(__dirname, '../fixtures'),
        use: [
          {
            // need file-loader and url-loader
            loader: 'url-loader',
            options: {
              limit: 5 * 1024,
              outputPath: 'images'
            }
          }
        ]
      },
      {
        test: /[\\.](woff2?|eot|ttf|otf)$/,
        include: resolve(__dirname, '../fixtures'),
        loader: 'url-loader',
        options: {
          limit: 10000,
          outputPath: 'fonts'
        }
      }
    ]
  },
  optimization: {
    runtimeChunk: { name: 'manifest' },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: {
          name: 'common',
          chunks: 'initial',
          minSize: 0,
          minChunks: 2,
          priority: -20
        },
        vendors: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|(\@babel)|core-js)[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          priority: -10
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[id].[name].[contenthash:6].css',
      chunkFilename: 'css/[id].[contenthash:6].css'
    }),
    new ManifestPlugin()
  ]
});
