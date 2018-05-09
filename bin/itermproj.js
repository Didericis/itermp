#! /usr/bin/env node
const program = require('commander');
const Main = require('../src/main');
const version = require('../package.json').version;

program
  .version(version)
  .option('-d, --debug', 'Print more verbose error logs')
  .parse(process.argv);

Main.run().catch(e => {
  if (program.debug) console.error(e);
  process.exit(1);
});
