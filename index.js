const { formatSize } = require('webpack/lib/SizeFormatHelpers');

const notSourceMap = fileName => !fileName.endsWith('.map');

function parseLimiter(value, name) {
  if (value == null) {
    return () => Number.MAX_VALUE;
  }

  switch (typeof value) {
    case 'number':
      return () => value;
    case 'object':
      return name => value[name] || value['_'] || Number.MAX_VALUE;
    case 'function':
      return value;
    default:
      throw new Error(
        `${name} need to be a number, object or function. Got ${typeof value}`
      );
  }
}

class SizeLimitWarning extends Error {
  constructor(invalidEntriesInfo, invalidChunksInfo) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'SizeLimitWarning';

    this.invalidEntriesInfo = invalidEntriesInfo;
    this.invalidChunksInfo = invalidChunksInfo;

    const entriesMsg = invalidEntriesInfo
      .map(
        ({ name, size, maxSize }) =>
          `${name} (${formatSize(size)}): when maxSize is ${formatSize(
            maxSize
          )}`
      )
      .join('\n');
    const chunksMsg = invalidChunksInfo
      .map(({ chunk, size, maxSize }) => {
        const strId = chunk.name
          ? chunk.name
          : chunk.files.filter(notSourceMap);
        return `${strId} (${formatSize(size)}): when maxSize is ${formatSize(
          maxSize
        )}`;
      })
      .join('\n');

    this.message =
      `SizeLimiter: size is overlimit\n` +
      (invalidEntriesInfo.length > 0 ? `\nEntries:\n${entriesMsg}\n` : '') +
      (invalidChunksInfo.length > 0 ? `\nChunks:\n${chunksMsg}\n` : '');
  }
}

class SizeLimiterPlugin {
  constructor({ chunks, entries, onlyWarn = false } = {}) {
    this.getSizeForChunk = parseLimiter(chunks);
    this.getSizeForEntry = parseLimiter(entries);
    this.onlyWarn = onlyWarn;
  }

  apply(compiler) {
    compiler.plugin('after-compile', (compilation, done) => {
      const getEntrypointSize = entrypoint =>
        entrypoint
          .getFiles()
          .map(file => compilation.assets[file])
          .filter(Boolean)
          .map(asset => asset.size())
          .reduce((currentSize, nextSize) => currentSize + nextSize, 0);

      const getChunkSize = chunk =>
        chunk.files
          .filter(notSourceMap)
          .map(assetName => compilation.assets[assetName].size())
          .reduce((acc, size) => acc + size, 0);

      const invalidEntries = Object.keys(compilation.entrypoints)
        .map(entryName => ({
          name: entryName,
          entrypoint: compilation.entrypoints[entryName],
          size: getEntrypointSize(compilation.entrypoints[entryName]),
          maxSize: this.getSizeForEntry(entryName)
        }))
        .filter(({ size, maxSize }) => size > maxSize);

      const invalidChunks = compilation.chunks
        .map(chunk => ({
          chunk,
          size: getChunkSize(chunk),
          maxSize: this.getSizeForChunk(chunk.name, chunk)
        }))
        .filter(({ size, maxSize }) => size > maxSize);

      if (invalidChunks.length > 0 || invalidEntries.length > 0) {
        (this.onlyWarn ? compilation.warnings : compilation.errors).push(
          new SizeLimitWarning(invalidEntries, invalidChunks)
        );
      }

      done(null);
    });
  }
}

module.exports = SizeLimiterPlugin;
