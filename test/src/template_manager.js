const { expect } = require('chai'); 
const sinon = require('sinon');
const fs = require('fs');
const os = require('os');

const TemplateManager = require('../../src/template_manager');

describe('TemplateManager', () => {
  def('log', () => sinon.stub());

  subject('templateManager', () => new TemplateManager($log));

  afterEach(() => {
    sinon.restore();
  });

  describe('#localConfigPath', () => {
    def('cwd', '/my/current/dir');

    subject(() => $templateManager.localConfigPath);

    beforeEach(() => {
      sinon.stub(process, 'cwd').returns($cwd);
    });

    it('gets set the right path', () => {
      expect($subject).to.eql(`${$cwd}/itermproj.json`);
    });
  });

  describe('#copy()', () => {
    def('src', 'i/am/src');
    def('dest', 'i/am/dest');
    def('readStream', { pipe: sinon.stub() });
    def('writeStream', { pipe: sinon.stub() });

    subject(() => $templateManager.copy($src, $dest));

    beforeEach(() => {
      sinon.stub(fs, 'createReadStream').returns($readStream);
      sinon.stub(fs, 'createWriteStream').returns($writeStream);
    });

    it('copies the source to the destination', () => {
      $subject;
      expect(fs.createReadStream.calledWith($src)).to.be.true;
      expect($readStream.pipe.calledWith($writeStream)).to.be.true;
      expect(fs.createWriteStream.calledWith($dest)).to.be.true;
    });
  });

  describe('#copyToLocal()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $templateManager.copyToLocal($name));

    beforeEach(() => {
      sinon.stub($templateManager, 'getPath').returns($templatePath);
      sinon.stub($templateManager, 'copy');
    });

    it('copies the template to the local config', () => {
      $subject;
      expect($templateManager.getPath.calledWith($name)).to.be.true;
      expect($templateManager.copy.calledWith(
        $templatePath,
        $templateManager.localConfigPath
      )).to.be.true;
    });
   
    it('emits the correct log', () => {
      $subject;
      expect(
        $templateManager.log.calledWith("'asdf' saved to ./itermproj.json")
      ).to.be.true;
    });
  });

  describe('#createFromLocal()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $templateManager.createFromLocal($name));

    beforeEach(() => {
      sinon.stub($templateManager, 'getPath').returns($templatePath);
      sinon.stub($templateManager, 'copy');
    });

    it('copies the local config to the template', () => {
      $subject;
      expect($templateManager.getPath.calledWith($name)).to.be.true;
      expect($templateManager.copy.calledWith(
        $templateManager.localConfigPath,
        $templatePath,
      )).to.be.true;
    });

    it('emits the correct log', () => {
      $subject;
      expect($templateManager.log.calledWith('Template created!')).to.be.true;
    });
  });

  describe('#delete()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $templateManager.delete($name));

    beforeEach(() => {
      sinon.stub($templateManager, 'getPath').returns($templatePath);
      sinon.stub(fs, 'unlinkSync');
    });

    it('delets the template', () => {
      $subject;
      expect(fs.unlinkSync.calledWith($templatePath)).to.be.true;
    });

    it('emits the correct log', () => {
      $subject;
      expect($templateManager.log.calledWith('Template deleted!')).to.be.true;
    });
  });

  describe('#dir', () => {
    def('homedir', '/this/is/home');

    subject(() => $templateManager.dir);

    beforeEach(() => {
      sinon.stub(os, 'homedir').returns($homedir);
    });

    it('sets the right path', () => {
      expect($subject).to.eql(`${$homedir}/.itermproj`);
    });
  });

  describe('#exists()', () => {
    def('name', 'my-cool-template');
    def('path', () => `/cool-template/path/${$name}.json`);

    subject(() => $templateManager.exists($name));

    beforeEach(() => {
      sinon.stub(fs, 'existsSync');
      sinon.stub($templateManager, 'getPath').returns($path);
    });

    it('checks if the template exists', () => {
      $subject;
      expect($templateManager.getPath.calledWith($name)).to.be.true;
      expect(fs.existsSync.calledWith($path)).to.be.true;
    });
  });

  describe('#getAll()', () => {
    subject(() => $templateManager.getAll());

    beforeEach(() => {
      sinon.stub(fs, 'readdir');
    });

    context('if there is a problem reading the files', () => {
      def('err', new Error('oopsies'));

      beforeEach(() => {
        fs.readdir.callsArgWith(1, $err);
      });

      it('rejects with the error', () => $subject.then(() => {
        expect(true, 'Unexpected resolve').to.be.false;
      }).catch(err => {
        expect(err).to.eql($err);
      }));
    });

    context('if there is no problem reading the files', () => {
      def('files', ['/hi/there/file1.json', '/hi/there/unexpected.something']);

      beforeEach(() => {
        fs.readdir.callsArgWith(1, null, $files);
      });

      it('resolves with all the correct files', () => $subject.then((files) => {
        expect(files).to.eql([
          'file1'
        ]);
      }));
    });
  });

  describe('#getPath()', () => {
    def('name', 'cool-name');

    subject(() => $templateManager.getPath($name));

    it('returns the correct path', () => {
      expect($subject).to.eql(`${$templateManager.dir}/${$name}.json`);
    });
  });

  describe('#localConfigExists()', () => {
    subject(() => $templateManager.localConfigExists());

    beforeEach(() => {
      sinon.stub(fs, 'existsSync');
    });

    it('performs the correct check', () => {
      $subject;
      expect(fs.existsSync.calledWith($templateManager.localConfigPath)).to.be.true;
    });
  });


  describe('#loadLocalConfig()', () => {
    def('cwd', '/cool/place');
    def('fileContents', '{}');
    subject(() => $templateManager.loadLocalConfig());

    beforeEach(() => {
      sinon.stub(process, 'cwd').returns($cwd);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, $fileContents);
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

  describe('#log()', () => {
    context('when a logger is given', () => {
      def('log', () => sinon.stub());

      it('uses the given logger', () => {
        expect($templateManager.log).to.equal($log);
      });
    });

    context('when no logger is given', () => {
      def('log', () => undefined);

      it('uses the console.log', () => {
        expect($templateManager.log).to.equal(console.log);
      });
    });
  });
});
