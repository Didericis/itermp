const os = require('os');
const fs = require('fs');
const path = require('path');

class Manager {
  constructor(log = console.log) {
    this.log = log;
    this.localConfigPath = path.resolve('itermproj.json');
    this.templateDir = path.resolve(os.homedir(), '.itermproj')
  }

  copy(src, dest) {
    return fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }

  copyTemplateToLocalConfig(name) {
    this.copy(this.getTemplatePath(name), this.localConfigPath);
    this.log(`'${name}' saved to ./itermproj.json`);
  }

  createTemplateFromLocalConfig(name) {
    this.copy(this.localConfigPath, this.getTemplatePath(name));
    this.log(`Template '${name}' created!`);
  }

  deleteTemplate(name) {
    fs.unlinkSync(this.getTemplatePath(name));
    this.log(`Template '${name}' deleted!`);
  }

  templateExists(name) {
   return fs.existsSync(this.getTemplatePath(name));
  }

  getAllTemplates() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.templateDir, (err, files) => {
        if (err) reject(err);
        else resolve(
          files
            .filter(f => path.extname(f) === '.json')
            .map(f => path.basename(f, '.json'))
        );
      });
    });
  }
  
  getTemplatePath(name) {
    return path.resolve(this.templateDir, `${name}.json`);
  }

  loadConfig(name) {
    const configPath = name ? this.getTemplatePath(name) : this.localConfigPath;
    return new Promise((resolve, reject) => {
      fs.readFile(configPath, 'utf8', (err, file) => {
        if (err) {
          console.error('Config not found!');
          reject(err);
        } else {
          try {
            resolve(JSON.parse(file));
          } catch(e) {
            console.error('Invalid config!');
            reject(e);
          }
        }
      });
    });
  }

  localConfigExists() {
    return fs.existsSync(this.localConfigPath);
  }
};

module.exports = Manager;
