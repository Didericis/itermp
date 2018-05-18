#! /usr/bin/env node
const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');
const yargs = require('yargs');

const UserActions = require('../src/user_actions');
const Manager = require('../src/manager');

const userActions = new UserActions();
const manager = new Manager();

const argv = yargs
  .options({ 
    create: { describe: 'Create pane configuration template from local itermproj.json' },
    debug: { describe: 'Emit more verbose errors' },
    list: { describe: 'List available pane configurations' },
    remove: { describe: 'Remove pane configuration' },
    save: { describe: 'Save pane configuration to local itermproj.json' },
  })
  .completion('completion', (currWord, argv) => {
    return manager.getAllTemplates().then(templates => templates.concat(['completion', 'help']));
  })
  .command('help', 'show help')
  .command('$0 [template]', 'run itermproj', () => {}, (argv) => {
    if (argv.remove) {
      userActions.deleteTemplate(argv.remove);
    } else if (argv.create) {
      userActions.createTemplate(typeof argv.create === 'string' ? argv.create : undefined);
    } else if (argv.save) {
      if (argv.save === true) console.error('Saving requires a template name!');
      else userActions.saveTemplate(argv.save);
    } else if (argv.list) {
      userActions.listTemplates();
    } else if (['completion'].includes(argv.template)) {
      yargs.showCompletionScript();
    } else {
      userActions.run(argv.template).catch(e => {
        if (argv.debug) console.error(e);
        process.exit(1);
      });
    }
  })
  .alias('c', 'create')
  .alias('d', 'debug')
  .alias('h', 'help')
  .alias('l', 'list')
  .alias('r', 'remove')
  .alias('s', 'save')
  .alias('v', 'version')
  .help('help')
  .argv



