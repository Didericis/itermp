const { expect } = require('chai'); 
const sinon = require('sinon');
const fs = require('fs');
const os = require('os');

const Manager = require('../../src/manager');

describe('Manager', () => {
  def('log', () => sinon.stub());

  subject('manager', () => new Manager($log));

  afterEach(() => {
    sinon.restore();
  });

  describe('#localConfigPath', () => {
    def('cwd', '/my/current/dir');

    subject(() => $manager.localConfigPath);

    beforeEach(() => {
      sinon.stub(process, 'cwd').returns($cwd);
    });

    it('gets set to the correct path', () => {
      expect($subject).to.eql(`${$cwd}/itermp.json`);
    });
  });

  describe('#copy()', () => {
    def('src', 'i/am/src');
    def('dest', 'i/am/dest');
    def('readStream', { pipe: sinon.stub() });
    def('writeStream', { pipe: sinon.stub() });

    subject(() => $manager.copy($src, $dest));

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

  describe('#copyTemplateToLocalConfig()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $manager.copyTemplateToLocalConfig($name));

    beforeEach(() => {
      sinon.stub($manager, 'getTemplatePath').returns($templatePath);
      sinon.stub($manager, 'copy');
    });

    it('copies the template to the local config', () => {
      $subject;
      expect($manager.getTemplatePath.calledWith($name)).to.be.true;
      expect($manager.copy.calledWith(
        $templatePath,
        $manager.localConfigPath
      )).to.be.true;
    });
   
    it('emits the correct log', () => {
      $subject;
      expect(
        $manager.log.calledWith("'asdf' saved to ./itermp.json")
      ).to.be.true;
    });
  });

  describe('#createTemplateFromLocalConfig()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $manager.createTemplateFromLocalConfig($name));

    beforeEach(() => {
      sinon.stub($manager, 'getTemplatePath').returns($templatePath);
      sinon.stub($manager, 'copy');
    });

    it('creates a template from the local config', () => {
      $subject;
      expect($manager.getTemplatePath.calledWith($name)).to.be.true;
      expect($manager.copy.calledWith(
        $manager.localConfigPath,
        $templatePath,
      )).to.be.true;
    });

    it('emits the correct log', () => {
      $subject;
      expect($manager.log.calledWith(`Template '${$name}' created!`)).to.be.true;
    });
  });

  describe('#deleteTemplate()', () => {
    def('name', 'asdf');
    def('templatePath', '/template/asdf.json');

    subject(() => $manager.deleteTemplate($name));

    beforeEach(() => {
      sinon.stub($manager, 'getTemplatePath').returns($templatePath);
      sinon.stub(fs, 'unlinkSync');
    });

    it('deletes the template', () => {
      $subject;
      expect(fs.unlinkSync.calledWith($templatePath)).to.be.true;
    });

    it('emits the correct log', () => {
      $subject;
      expect($manager.log.calledWith(`Template '${$name}' deleted!`)).to.be.true;
    });
  });

  describe('#templateDir', () => {
    def('homedir', '/this/is/home');

    subject(() => $manager.templateDir);

    beforeEach(() => {
      sinon.stub(os, 'homedir').returns($homedir);
    });

    it('gets set to the correct path', () => {
      expect($subject).to.eql(`${$homedir}/.itermp`);
    });
  });

  describe('#templateExists()', () => {
    def('name', 'my-cool-template');
    def('path', () => `/cool-template/path/${$name}.json`);

    subject(() => $manager.templateExists($name));

    beforeEach(() => {
      sinon.stub(fs, 'existsSync');
      sinon.stub($manager, 'getTemplatePath').returns($path);
    });

    it('checks if the template exists', () => {
      $subject;
      expect($manager.getTemplatePath.calledWith($name)).to.be.true;
      expect(fs.existsSync.calledWith($path)).to.be.true;
    });
  });

  describe('#getAllTemplates()', () => {
    subject(() => $manager.getAllTemplates());

    beforeEach(() => {
      sinon.stub(fs, 'readdir');
    });

    context('when there is a problem reading the files', () => {
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

    context('when there is no problem reading the files', () => {
      def('files', ['/hi/there/file1.json', '/hi/there/unexpected.something']);

      beforeEach(() => {
        fs.readdir.callsArgWith(1, null, $files);
      });

      it('resolves with all the json file names', () => $subject.then((files) => {
        expect(files).to.eql([
          'file1'
        ]);
      }));
    });
  });

  describe('#getTemplatePath()', () => {
    def('name', 'cool-name');

    subject(() => $manager.getTemplatePath($name));

    it('returns the correct path', () => {
      expect($subject).to.eql(`${$manager.templateDir}/${$name}.json`);
    });
  });

  describe('#localConfigExists()', () => {
    subject(() => $manager.localConfigExists());

    beforeEach(() => {
      sinon.stub(fs, 'existsSync');
    });

    it('checks that there is a file at localConfigPath', () => {
      $subject;
      expect(fs.existsSync.calledWith($manager.localConfigPath)).to.be.true;
    });
  });


  describe('#loadConfig()', () => {
    def('cwd', '/cool/place');
    def('fileContents', '{}');
    def('fileError', null);
    def('name', undefined);
    subject(() => $manager.loadConfig($name));

    beforeEach(() => {
      sinon.stub(process, 'cwd').returns($cwd);
      sinon.stub(fs, 'readFile').callsArgWith(2, $fileError, $fileContents);
    });

    context('when no name is given', () => {
      def('name', undefined);

      it('reads itermp.json from the current working directory', () => $subject.then(() => {
        expect(fs.readFile.called).to.be.true;
        expect(fs.readFile.args[0][0]).to.eql(`${$cwd}/itermp.json`);
      }));
    });

    context('when a name is given', () => {
      def('name', 'thingy');

      it('reads from the template', () => $subject.then(() => {
        expect(fs.readFile.called).to.be.true;
        expect(fs.readFile.args[0][0]).to.eql(`${$manager.templateDir}/${$name}.json`);
      }));
    });

    context('when the file exists', () => {
      def('fileError', null);

      context('and is invalid json', () => {
        def('fileContents', '{ "asdf": asdf },');

        beforeEach(() => {
          sinon.stub(console, 'error');
        });

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
        expect($manager.log).to.equal($log);
      });
    });

    context('when no logger is given', () => {
      def('log', () => undefined);

      it('uses console.log', () => {
        expect($manager.log).to.equal(console.log);
      });
    });
  });
});
