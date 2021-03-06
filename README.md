<h1 align="center">Welcome to log-filesize-webpack-plugin 👋</h1>

<p>
  <a href="https://www.npmjs.com/package/@jsany/log-filesize-webpack-plugin" target="_blank">
    <img alt="npm version" src="https://img.shields.io/npm/v/@jsany/log-filesize-webpack-plugin/latest?logo=npm&style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/@jsany/log-filesize-webpack-plugin" target="_blank">
    <img alt="npm miniziped size" src="https://img.shields.io/bundlephobia/minzip/@jsany/log-filesize-webpack-plugin/latest?logo=npm&style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/@jsany/log-filesize-webpack-plugin" target="_blank">
    <img alt="node version" src="https://img.shields.io/node/v/@jsany/log-filesize-webpack-plugin?color=blue&style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/@jsany/log-filesize-webpack-plugin" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/jsany/log-filesize-webpack-plugin/Publish?logo=github&style=flat-square" />
  </a>
  <a href="https://codecov.io/gh/jsany/log-filesize-webpack-plugin" target="_blank">
    <img alt="codecov" src="https://img.shields.io/codecov/c/github/jsany/log-filesize-webpack-plugin/main?logo=codecov&style=flat-square" />
  </a>
  <a href="https://github.com/jsany/log-filesize-webpack-plugin#readme" target="_blank">
    <img alt="documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://github.com/jsany/log-filesize-webpack-plugin/graphs/commit-activity" target="_blank">
    <img alt="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/jsany/log-filesize-webpack-plugin/blob/main/LICENSE" target="_blank">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" />
  </a>
</p>

> log assets size pretty after webpack build(wirte by typescript)

### 🏠 [Homepage](https://github.com/jsany/log-filesize-webpack-plugin#readme)

### ✨ [Example](https://github.com/jsany/log-filesize-example)

<https://github.com/jsany/log-filesize-example/blob/main/webpack.config.js#L168>

## Prerequisites

- node >=10
- webpack >=4

## Install

```sh
yarn add -D @jsany/log-filesize-webpack-plugin
# or npm install --save-dev @jsany/log-filesize-webpack-plugin
```

## Setup

### In `webpack.config.js`:

```js
const LogFilesizeWebpackPlugin = require('@jsany/log-filesize-webpack-plugin');

module.exports = {
  stats: 'none', // to close webpack print
  // ...
  plugins: [
    new LogFilesizeWebpackPlugin()
    // or
    // new LogFilesizeWebpackPlugin({gzip: true,...OtherOptions})
  ]
  // ...
};
```

### Then run build, it will look like this:

![example](screenshots/example.png)

## Options

| Options    | Type                                                                                               | Default                                                     | Description                                                           |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `gzip`     | boolean                                                                                            | `true`                                                      | Print gzipped filesize                                                |
| `errors`   | boolean                                                                                            | `true`                                                      | Print compile errors                                                  |
| `warnings` | boolean                                                                                            | `true`                                                      | Print compile warnings                                                |
| `hash`     | boolean                                                                                            | `true`                                                      | Print current compile hash                                            |
| `version`  | boolean                                                                                            | `true`                                                      | Print current webpack version                                         |
| `time`     | boolean                                                                                            | `true`                                                      | Print compile cost time                                               |
| `builtAt`  | boolean                                                                                            | `true`                                                      | Print when to start compiling                                         |
| `maxSize`  | number                                                                                             | `1.8 * 1024 * 1024` (Byte)                                  | These sizes are pretty large. We'll warn for bundles exceeding them   |
| `priority` | { js?: number, css?: number,image?: number,font?: number,json?: number,txt?: number,html?: number} | `{ js: 10, css: 9,image: 8,font: 7,json: 6,txt: 5,html: 4}` | The larger the value, the higher the sort, and hide if less than zero |

## Feature

- [x] Support javascript and switch log it
- [x] Support css and switch log it
- [x] Support image and switch log it
- [x] Support json and switch log it
- [x] Support font and switch log it
- [x] Support txt and switch log it
- [x] Support html and switch log it
- [x] Support custom assets log priority

## Todo

- [ ] Support custom file color
- [ ] ...

### Support files with these extensions: [ext look detail](./src/helper/mimeMap.ts)

## Author

👤 **jiangzhiguo2010**

- Website: <https://github.com/Mr-jiangzhiguo/book>
- Github: [@jsany](https://github.com/jsany)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/jsany/log-filesize-webpack-plugin/issues). You can also take a look at the [contributing guide](https://github.com/jsany/log-filesize-webpack-plugin/blob/main/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [jiangzhiguo2010](https://github.com/jsany).<br />
This project is [MIT](https://github.com/jsany/log-filesize-webpack-plugin/blob/main/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
