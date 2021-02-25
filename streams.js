// From: https://github.com/manisuec/study/tree/master/streams

const fs = require('fs');
const path = require('path');
const split = require('split');
const { Transform, pipeline } = require('stream');

const filterData = (fn, options = {}) =>
  new Transform({
    objectMode: true,
    ...options,

    transform(chunk, encoding, next) {
      let take;
      let obj;
      try {
        obj = chunk.toString();
      } catch (e) {}
      try {
        take = fn(obj);
      } catch (e) {
        return next(e);
      }
      return next(null, take ? `${chunk}\n` : undefined);
    },
  });

const filterCondition = line => {
  if (line) {
    return line.length > 0 && !line.match(/^[\s]*#/)
  }
  return false;
};

const READ_FILE_PATH = './env';

const readStream = fs.createReadStream(path.resolve(READ_FILE_PATH));
const writeStream = process.stdout; // Note: this needs to be a write to github secrets

pipeline(
  readStream,
  split(),
  filterData(filterCondition),
  writeStream,
  err => {
    if (err) {
      console.error('Pipeline failed.', err);
    } else {
      console.log('Pipeline succeeded.');
    }
  },
);
