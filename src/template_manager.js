const os = require('os');
const fs = require('fs');
const path = require('path');

class TemplateManager {
  constructor(log = console.log) {
    this.log = log;
    this.localConfigPath = path.resolve('itermproj.json');
    this.dir = path.resolve(os.homedir(), '.itermproj')
  }

  copy(src, dest) {
    return fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }

  copyToLocal(name) {
    this.copy(this.getPath(name), this.localConfigPath);
    this.log(`'${name}' saved to ./itermproj.json`);
  }

  createFromLocal(name) {
    this.copy(this.localConfigPath, this.getPath(name));
    this.log('Template created!');
  }

  delete(name) {
    fs.unlinkSync(this.getPath(name));
    this.log('Template deleted!');
  }

  exists(name) {
   return fs.existsSync(this.getPath(name));
  }

  getAll() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dir, (err, files) => {
        if (err) reject(err);
        else resolve(
          files
            .filter(f => path.extname(f) === '.json')
            .map(f => path.basename(f, '.json'))
        );
      });
    });
  }
  
  getPath(name) {
    return path.resolve(this.dir, `${name}.json`);
  }

  loadLocalConfig() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.localConfigPath, 'utf8', (err, file) => {
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

module.exports = TemplateManager;
