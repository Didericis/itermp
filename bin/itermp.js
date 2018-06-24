#! /usr/bin/env node
const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');
const yargs = require('yargs');

const UserActions = require('../src/user_actions');
const Manager = require('../src/manager');

const manager = new Manager();

const argv = yargs
  .options({ 
    global: { describe: 'Create a global pane configuration from ./itermproj.json' },
    debug: { describe: 'Emit more verbose errors' },
    init: { describe: 'Initialize ./itermproj.json from global pane configuration' },
    list: { describe: 'List global pane configurations' },
    remove: { describe: 'Remove global pane configuration' },
  })
  .completion('completion', (currWord, argv) => {
    return manager.getAllTemplates().then(templates => templates.concat(['completion', 'help']));
  })
  .command('help', 'show help')
  .strict()
  .command('$0 [template]', 'run itermproj', () => {}, (argv) => {
    const userActions = new UserActions({ debug: argv.debug });
    if (argv.remove) {
      userActions.removeTemplate(argv.remove);
    } else if (argv.global) {
      userActions.createGlobalTemplate(
        typeof argv.global === 'string' ? argv.global : undefined
      );
    } else if (argv.init) {
      userActions.initTemplate(typeof argv.init === 'string' ? argv.init : undefined);
    } else if (argv.list) {
      userActions.listTemplates();
    } else if (['completion'].includes(argv.template)) {
      yargs.showCompletionScript();
    } else {
      userActions.execute(argv.template).catch(e => {
        if (argv.debug) console.error(e);
        process.exit(1);
      });
    }
  })
  .alias('i', 'init')
  .alias('g', 'global')
  .alias('d', 'debug')
  .alias('h', 'help')
  .alias('l', 'list')
  .alias('r', 'remove')
  .alias('v', 'version')
  .help('help')
  .argv



