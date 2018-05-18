const applescript = require('applescript');
const os = require('os');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const Parser = require('../src/parser');
const Manager = require('../src/manager');

class UserActions {
  constructor(log = console.log) {
    this.log = log;
    this.manager = new Manager(log);
  }

  createTemplate(name) {
    return (name ? 
      Promise.resolve(name) :
      inquirer.prompt([{
        type: 'input',
        message: 'Template name:',
        name: 'template'
      }]).then(({ template }) => template)
    ).then(template => {
      if (!this.manager.templateExists(template)) return template;
      return inquirer.prompt([{
        type: 'confirm',
        message: 'A template by that already templateExists. Overwrite?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite ? template : null);
    }).then(template => {
      if (!template) return;
      this.manager.copyTemplateToLocalConfig(template);
    });
  }

  deleteTemplate(name) {
    if (!this.manager.templateExists(name)) {
      this.log(`No template named '${name}' exists!`);
      return Promise.resolve();
    }
    return inquirer.prompt([{
      type: 'confirm',
      message: 'Are you sure?',
      name: 'del'
    }]).then(({ del }) => {
      if (!del) return;
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
          { key: 'd', name: 'delete' }, 
          { key: 'r', name: 'run' }, 
          { key: 's', name: 'save' }, 
        ]
      }]).then(({ template, action }) => {
        switch (action) {
          case 'delete': return this.deleteTemplate(template);
          case 'run': return this.run(template);
          case 'save': return this.saveTemplate(template);
          default: return;
        }
      })
    });
  }

  run(name) {
    if (!name && !this.manager.localConfigExists()) {
      return this.listTemplates();
    } else {
      return this.manager.loadLocalConfig(
        name ? this.manager.getTemplatePath(name) : undefined).then(conf => {
        applescript.execString(Parser.parse(conf), (err) => {
          if (err) throw (err);
        });
      });
    }
  }

  saveTemplate(name) {
    return (this.manager.localConfigExists() ?
      inquirer.prompt([{
        type: 'confirm',
        message: 'Overwrite existing itermproj.json?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite) : Promise.resolve(true)
    ).then(save => {
      if (!save) return;
      this.manager.copyTemplateToLocalConfig(name);
    });
  }
}

module.exports = UserActions;