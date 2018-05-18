#! /usr/bin/env node
const UserActions = require('../src/user_actions');
const version = require('../package.json').version;

const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');

const userActions = new UserActions();

const argv = require('yargs')
  .usage('$0', 'launch a local itermproj configuration')
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

const parseArg = (name) => (
  argv._[0] || 
  (typeof argv[name] === 'string' ? argv[name] : undefined)
);

if (argv.delete) {
  userActions.deleteTemplate(parseArg('delete'));
} else if (argv.create) {
  userActions.createTemplate(parseArg('create'));
} else if (argv.save) {
  userActions.saveTemplate(parseArg('save'));
} else if (argv.list) {
  userActions.listTemplates();
} else {
  userActions.run(argv._[0]).catch(e => {
    if (argv.debug) console.error(e);
    process.exit(1);
  });
}

