const applescript = require('applescript');
const inquirer = require('inquirer');

const Parser = require('../src/parser');
const Manager = require('../src/manager');

class UserActions {
  constructor(options = {}) {
    this.manager = new Manager(options.log);
    this.debug = options.debug;
  }

  createGlobalTemplate(name) {
    if (!this.manager.localConfigExists()) {
      console.error('No local config exists!');
      return Promise.resolve();
    }
    return (name ?
      Promise.resolve(name) :
      inquirer.prompt([{
        type: 'input',
        message: 'Template name:',
        name: 'template'
      }]).then(({ template }) => template)
    ).then(template => {
      if (!this.manager.templateExists(name)) return template;
      return inquirer.prompt([{
        type: 'confirm',
        message: 'A template by that already exists. Overwrite?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite ? template : null);
    }).then(template => {
      if (!template) return;
      this.manager.createTemplateFromLocalConfig(template);
    });
  }

  removeTemplate(name) {
    if (!this.manager.templateExists(name)) {
      console.error(`No template named '${name}' exists!`);
      return Promise.resolve();
    }
    return inquirer.prompt([{
      type: 'confirm',
      message: `Remove the '${name}' template?`,
      name: 'remove'
    }]).then(({ remove }) => {
      if (!remove) return;
      this.manager.deleteTemplate(name)
    });
  }

  listTemplates() {
    return this.manager.getAllTemplates().then(templates => {
      return inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: 'Avaliable templates:',
        choices: [new inquirer.Separator(), ...templates]
      }, {
        type: 'expand',
        name: 'action',
        message: 'What do you want to do?:',
        choices: [
          { key: 'r', name: 'remove' },
          { key: 'e', name: 'execute' },
          { key: 'i', name: 'init' },
        ]
      }]).then(({ template, action }) => {
        switch (action) {
          case 'remove': return this.removeTemplate(template);
          case 'execute': return this.execute(template);
          case 'init': return this.initTemplate(template);
          default: return;
        }
      })
    });
  }

  execute(name) {
    if (!name && !this.manager.localConfigExists()) {
      return this.listTemplates();
    } else {
      return this.manager.loadConfig(name).then(conf => {
        const scriptString = Parser.parse(conf);
        if (this.debug) {
          console.log('==== AppleScript ===')
          console.log(scriptString);
          console.log('==== End AppleScript ===')
        }
        applescript.execString(scriptString, (err) => {
          if (err) throw (err);
        });
      });
    }
  }

  initTemplate(name) {
    if (name && !this.manager.templateExists(name)) {
      console.error(`Template '${name}' does not exist!`);
      return Promise.resolve();
    }
    return (this.manager.localConfigExists() ?
      inquirer.prompt([{
        type: 'confirm',
        message: 'Overwrite existing itermproj.json?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite) : Promise.resolve(true)
    ).then(save => {
      if (!save) return;
      if (name) this.manager.copyTemplateToLocalConfig(name);
      else this.manager.initLocalConfig();
    });
  }
}

module.exports = UserActions;
