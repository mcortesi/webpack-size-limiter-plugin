## SizeLimiterPlugin

Webpack Plugin to check & limit bundle size.

It's heavily inspired in the default [SizeLimitsPlugin](https://github.com/webpack/webpack/blob/ec39460deb876eda38f266b0964a1d19a7103089/lib/performance/SizeLimitsPlugin.js) but provides more flexibility in the rules definition. You can define different maxSizes depending if it's an entry point or a chunk, or dependig the entry name. Which can be useful if you have entry points that are known to be more *heavy* that others, but are expected to do so.

## Usage

Add the plugin to your webpack.config.js

```js
// webpack.config.js
const SizeLimiterPlugin = require('webpack-size-limiter-plugin');

module.exports = {
  ...
  plugins: [
    new SizeLimiterPlugin({
      onlyWarn: true,
      entries: {
        first: 10000,
        second: 19.2 * 1000
      },
      chunks: chunk => {
        return 10;
      }
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
}

```

## Options:

 * `onlyWarn`: Show a warning instead of an error. [`false` by default]
 * `entries`: Defines max size for webpack entries. It can be: 
   * a `number` that defines max size for any entry,
   * an object that maps entry name to maxSize
   * a function `(entryName: string) => number` that returns maxSize for an entry.
 * `chunks`: Defines max size for webpack chunks (that are NOT entries). It can be 
   * a `number` that defines max size for any chunk
   * an object that maps chunk name to maxSize
   * a function `(chunkName: string, chunk: Chunk) => number` that returns maxSize for an chunk. 
   Be aware that instead you define them, chunks that are not entries have no name. You can use 
   the `chunk.files` to identify them, or any other property in the [Chunk class](https://github.com/webpack/webpack/blob/ec39460deb876eda38f266b0964a1d19a7103089/lib/Chunk.js)

*Important*: The plugin won't stop webpack emit of bundle files, it will just report errors or warnings. If you
want to stop emiting on error use the `NoEmitOnErrorsPlugin` for that.

## Example:

Check the [example](./example/webpack.config.js) included in the module.
