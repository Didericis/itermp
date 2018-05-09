const applescript = require('applescript');

const Parser = require('../src/parser');
const ConfigLoader = require('../src/config_loader');

const run = () => ConfigLoader.load().then(conf => {
  applescript.execString(Parser.parse(conf), (err) => {
    if (err) throw (err);
  });
});

module.exports = { run };
