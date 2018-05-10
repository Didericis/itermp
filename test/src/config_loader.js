const fs = require('fs');
const sinon = require('sinon');
const { expect } = require('chai');

const ConfigLoader = require('../../src/config_loader');

describe('ConfigLoader', () => {
  describe('.load()', () => {
    def('cwd', '/cool/place');
    def('fileContents', '{}');
    subject('loadConfig', () => ConfigLoader.load());

    beforeEach(() => {
      sinon.stub(process, 'cwd').returns($cwd);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, $fileContents);
    });
    
    afterEach(() => {
      sinon.restore();
    });

    it('reads itermproj.json from the current working directory', () => $subject.then(() => {
      expect(fs.readFile.called).to.be.true;
      expect(fs.readFile.args[0][0]).to.eql(`${$cwd}/itermproj.json`);
    }));

    context('when the file exists', () => {
      beforeEach(() => {
        sinon.stub(console, 'error');
      });

      context('and is invalid json', () => {
        def('fileContents', '{ "asdf": asdf },');

        it('emits a user friendly console error', () => $subject.then(() => {
          expect(true, 'Promise resolved unexpectedly').to.be.false;
        }).catch((e) => {
          expect(e).to.be.instanceof(SyntaxError);
          expect(console.error.called).to.be.true;
          expect(console.error.args[0][0]).to.eql('Invalid config!');
        }));
      });

      context('and is valid json', () => {
        def('fileContents', '{ "asdf": "asdf" }');
        it('returns the contents as an object', () => $subject.then((conf) => {
          expect(conf).to.eql({ asdf: 'asdf' });
        }));
      });
    });

    context('when the file does not exist', () => {
      def('readFileError', () => new Error('oopsie'));
      beforeEach(() => {
        fs.readFile.callsArgWith(2, $readFileError);
        sinon.stub(console, 'error');
      });

      it('emits a user friendly console error', () => $subject.then(() => {
        expect(true, 'Promise resolved unexpectedly').to.be.false;
      }).catch((e) => {
        expect(e).to.eql($readFileError);
        expect(console.error.called).to.be.true;
        expect(console.error.args[0][0]).to.eql('Config not found!');
      }));
    });
  });
});
