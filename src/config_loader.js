const path = require('path');
const fs = require('fs');

const DEFAULT_PATH = () => path.resolve(process.cwd(), './itermproj.json');

const load = (configPath = DEFAULT_PATH()) => 
  new Promise((resolve, reject) => {
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

module.exports = { load };
