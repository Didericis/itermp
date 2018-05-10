const applescript = require('applescript');
const os = require('os');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const Parser = require('../src/parser');
const ConfigLoader = require('../src/config_loader');

const TEMPLATE_DIR = `${os.homedir()}/.itermproj`;
const CONFIG_PATH = () => path.resolve(process.cwd(), 'itermproj.json');

const Main = {
  copy: (src, dest) => fs.createReadStream(src).pipe(fs.createWriteStream(dest)),

  copyTemplateToLocal: (name) => {
    Main.copy(Main.getTemplatePath(name), CONFIG_PATH());
    Main.log(`'${name}' saved to ./itermproj.json`);
  },

  copyLocalToTemplate: (name) => {
    Main.copy(CONFIG_PATH(), Main.getTemplatePath(name));
    Main.log('Template created!');
  },

  createTemplate: (name) =>
    (name ? 
      Promise.resolve(name) :
      inquirer.prompt([{
        type: 'input',
        message: 'Template name:',
        name: 'template'
      }]).then(({ template }) => template)
    ).then(template => {
      if (!Main.templateExists(template)) return template;
      return inquirer.prompt([{
        type: 'confirm',
        message: 'A template by that already exists. Overwrite?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite ? template : null);
    }).then(template=> {
      if (!template) return;
      Main.copyLocalToTemplate(template);
    }),

  deleteTemplate: (name) => {
    if (!Main.templateExists(name)) {
      Main.log(`No template named '${name}' exists!`);
      return Promise.resolve();
    }
    return inquirer.prompt([{
      type: 'confirm',
      message: 'Are you sure?',
      name: 'del'
    }]).then(({ del }) => {
      if (!del) return;
      Main.deleteTemplateFile(name)
    });
  },

  deleteTemplateFile: (name) => {
    fs.unlinkSync(Main.getTemplatePath(name));
    Main.log('Template deleted!');
  },

  getTemplates: () => 
    new Promise((resolve, reject) => {
      fs.readdir(TEMPLATE_DIR, (err, files) => {
        if (err) reject(err);
        else resolve(files.map(f => path.basename(f, '.json')));
      });
    }),
  
  getTemplatePath: (name) => path.resolve(TEMPLATE_DIR, `${name}.json`),

  listTemplates: () => Main.getTemplates().then(templates => (
    inquirer.prompt([{
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
        case 'delete': return Main.deleteTemplate(template);
        case 'run': return Main.run(template);
        case 'save': return Main.saveTemplate(template);
        default: return;
      }
    })
  )),

  localConfigExists: () => fs.existsSync(CONFIG_PATH()),

  log: (m) => console.log(m),

  run: (name) => {
    if (!name && !Main.localConfigExists()) {
      return Main.listTemplates();
    } else {
      return ConfigLoader.load(name ? Main.getTemplatePath(name) : undefined).then(conf => {
        applescript.execString(Parser.parse(conf), (err) => {
          if (err) throw (err);
        });
      });
    }
  },

  saveTemplate: (name) =>
    (Main.localConfigExists() ?
      inquirer.prompt([{
        type: 'confirm',
        message: 'Overwrite existing itermproj.json?',
        name: 'overwrite'
      }]).then(({ overwrite }) => overwrite) : Promise.resolve(true)
    ).then(save => {
      if (!save) return;
      Main.copyTemplateToLocal(name);
    }),

  templateExists: (template) => fs.existsSync(Main.getTemplatePath(template)),
};

module.exports = Main;
