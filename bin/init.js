#! /usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const TEMPLATE_DIR = path.resolve(os.homedir(), '.itermproj');
const BASIC_TEMPLATE_DEST = path.resolve(os.homedir(), '.itermproj/basic.json');
const BASIC_TEMPLATE_SRC = path.resolve(__dirname, '../itermproj.json');

if (!fs.existsSync(TEMPLATE_DIR)) {
  fs.mkdirSync(TEMPLATE_DIR);
  console.log('Created "~/.itermproj" directory');
}

if (!fs.existsSync(BASIC_TEMPLATE_DEST)) {
  fs.createReadStream(BASIC_TEMPLATE_SRC).pipe(fs.createWriteStream(BASIC_TEMPLATE_DEST));
  console.log('"basic" added to ~/.itermproj');
}
