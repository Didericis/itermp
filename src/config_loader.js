const path = require('path');
const fs = require('fs');

const load = () => 
  new Promise((resolve, reject) => {
    const itermProjPath = path.resolve(process.cwd(), './itermproj.json');
    fs.readFile(itermProjPath, 'utf8', (err, file) => {
      if (err) {
        console.error('No itermproj.json found!');
        reject(err);
      } else {
        try {
          resolve(JSON.parse(file));
        } catch(e) {
          console.error('Invalid itermproj.json!');
          reject(e);
        }
      }
    });
  });

module.exports = { load };
