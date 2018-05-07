#! /usr/bin/env node
const path = require('path');
const applescript = require('applescript');

const parse = require('../parse');
const conf = require(path.resolve(process.cwd(), './itermproj.json'));

applescript.execString(parse(conf), (err) => {
  if (err) console.error(err);
});
