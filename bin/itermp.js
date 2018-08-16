#! /usr/bin/env node
const yargs = require('yargs');

const UserActions = require('../src/user_actions');
const Manager = require('../src/manager');

const manager = new Manager();

const processOptionalStringArg = ({ arg, func }) => {
  if (typeof arg === 'string') {
    func(arg);
  } else {
    func()
  }
};

/* eslint-disable no-unused-expressions */
yargs
  .options({
    global: { describe: 'Create a global pane configuration from ./itermproj.json' },
    debug: { describe: 'Emit more verbose errors' },
    init: { describe: 'Initialize ./itermproj.json from global pane configuration' },
    list: { describe: 'List global pane configurations' },
    remove: { describe: 'Remove global pane configuration' },
  })
  .completion('completion', () => {
    return manager.getAllTemplates().then(templates => templates.concat(['completion', 'help']));
  })
  .command('help', 'show help')
  .strict()
  .command('$0 [template]', 'run itermproj', () => null, (argv) => {
    const userActions = new UserActions({ debug: argv.debug });
    if (argv.remove) {
      userActions.removeTemplate(argv.remove);
    } else if (argv.global) {
      processOptionalStringArg({ arg: argv.remove, func: userActions.createGlobalTemplate });
    } else if (argv.init) {
      processOptionalStringArg({ arg: argv.init, func: userActions.initTemplate });
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
