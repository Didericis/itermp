#! /usr/bin/env node
const Main = require('../src/main');
const version = require('../package.json').version;

const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');

const argv = require('yargs')
  .options({ 
    delete: { 
      describe: 'Delete pane configuration',
      alias: 'd'
    }
  })
  .options({ 
    save: { 
      describe: 'Save pane configuration to local itermproj.json',
      alias: 's'
    }
  })
  .options({ 
    list: { 
      describe: 'List available pane configurations',
      alias: 'l'
    }
  })
  .options({ 
    create: { 
      describe: 'Create pane configuration template from local itermproj.json',
      alias: 'c'
    }
  })
  .options({ 
    debug: { 
      describe: 'Emit more verbose errors',
      alias: 'd'
    }
  })
  .completion('completion', (currWord, argv) => {
    return Main.getTemplates();
  })
  .help('help')
  .alias('h', 'help')
  .argv

if (argv.delete) {
  Main.deleteTemplate(argv.delete);
} else if (argv.create) {
  Main.createTemplate(
    argv._[0] || 
    (typeof argv.create === 'string' ? argv.create : undefined)
  );
} else if (argv.save) {
  Main.saveTemplate(
    argv._[0] || 
    (typeof argv.save === 'string' ? argv.save : undefined)
  );
} else if (argv.list) {
  Main.listTemplates();
} else {
  Main.run(argv._[0]).catch(e => {
    if (argv.debug) console.error(e);
    process.exit(1);
  });
}

