const { expect } = require('chai'); 
const sinon = require('sinon');
const applescript = require('applescript');

const ConfigLoader = require('../../src/config_loader');
const Parser = require('../../src/parser');
const Main = require('../../src/main');

describe('itermproj', () => {
  subject(() => Main.run());

  beforeEach(() => {
    sinon.stub(Parser, 'parse').returns($parsedConfig);
    sinon.stub(applescript, 'execString');
  });

  afterEach(() => {
    sinon.restore();
  });

  context('when the config is loaded', () => {
    def('parsedConfig', '');
    def('config', {});

    beforeEach(() => {
      sinon.stub(ConfigLoader, 'load').returns(Promise.resolve($config));
    });

    it('parses the config and executes the result', () => $subject.then(() => {
      expect(Parser.parse.called).to.be.true;
      expect(Parser.parse.args[0][0]).to.eql($config);
      expect(applescript.execString.called).to.be.true;
      expect(applescript.execString.args[0][0]).to.eql($parsedConfig);
    }));

    context('and there is an error executing the script', () => {
      def('scriptErr', () => new Error('oops'));
      beforeEach(() => {
        applescript.execString.callsArgWith(1, $scriptErr);
      });

      it('rejects with the correct error', () => $subject.then(() => {
        expect(true, 'Expected to reject').to.be.false;
      }).catch(e => {
        expect(e).to.eql($scriptErr);
      }));
    });
  });
});
