const applescript = require('applescript');
const os = require('os');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const Parser = require('../src/parser');
const TemplateManager = require('../src/template_manager');

class UserActions {
  constructor(templateManager = new TemplateManager()) {
    this.templateManager = templateManager;
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
      if (!this.templateManager.exists(template)) return template;
      return inquirer.prompt([{
        type: 'confirm',
        message: 'A template by that already exists. Overwrite?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite ? template : null);
    }).then(template => {
      if (!template) return;
      this.templateManager.copyToLocal(template);
    });
  }

  deleteTemplate(name) {
    if (!this.templateManager.exists(name)) {
      this.templateManager.log(`No template named '${name}' exists!`);
      return Promise.resolve();
    }
    return inquirer.prompt([{
      type: 'confirm',
      message: 'Are you sure?',
      name: 'del'
    }]).then(({ del }) => {
      if (!del) return;
      this.templateManager.delete(name)
    });
  }

  listTemplates() {
    return this.templateManager.getAll().then(templates => {
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
    if (!name && !this.templateManager.localConfigExists()) {
      return this.listTemplates();
    } else {
      return this.templateManager.loadLocalConfig(
        name ? this.templateManager.getPath(name) : undefined).then(conf => {
        applescript.execString(Parser.parse(conf), (err) => {
          if (err) throw (err);
        });
      });
    }
  }

  saveTemplate(name) {
    return (this.templateManager.localConfigExists() ?
      inquirer.prompt([{
        type: 'confirm',
        message: 'Overwrite existing itermproj.json?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite) : Promise.resolve(true)
    ).then(save => {
      if (!save) return;
      this.templateManager.copyToLocal(name);
    });
  }
}

UserActions.create = function create() {
  return new UserActions(...arguments);
}

module.exports = UserActions;
