const { expect } = require('chai'); 
const sinon = require('sinon');
const applescript = require('applescript');
const inquirer = require('inquirer');
const fs = require('fs');

const ConfigLoader = require('../../src/config_loader');
const Parser = require('../../src/parser');
const Main = require('../../src/main');

describe('Main', () => {
  beforeEach(() => {
    sinon.stub(inquirer, 'prompt');
    sinon.stub(Main, 'deleteTemplateFile');
    sinon.stub(Main, 'copy');
    sinon.stub(Main, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('.createTemplate()', () => {
    subject(() => Main.createTemplate($name));

    context('when not given a name', () => {
      def('name', undefined);

      beforeEach(() => {
        inquirer.prompt.returns(Promise.resolve({}));
      });

      it('asks for a template name', () => $subject.then(() => {
        expect(inquirer.prompt.args[0][0][0]).to.include({
          type: 'input',
          name: 'template'
        });
      }));
    });

    context('when given a name', () => {
      def('name', 'stuff');

      context('and the template exists', () => {
        def('overwrite', true);
        beforeEach(() => {
          inquirer.prompt.returns(Promise.resolve({ overwrite: $overwrite }));
          sinon.stub(Main, 'templateExists').returns(true);
        });

        it('asks for confirmation', () => $subject.then(() => {
          expect(inquirer.prompt.args[0][0][0]).to.include({
            type: 'confirm',
            name: 'overwrite'
          });
        }));

        context('and the user confirms overwriting the template', () => {
          def('overwrite', true);
          it('copies the template', () => $subject.then(() => {
            expect(Main.copy.called).to.be.true;
            expect(Main.copy.args[0][1]).to.include($name);
          }));
        });

        context('and the user does not confirm overwriting the template', () => {
          def('overwrite', false);
          it('does not copy the template', () => $subject.then(() => {
            expect(Main.copy.called).to.be.false;
          }));
        });
      });
    });
  });

  describe('.deleteTemplate()', () => {
    def('name', 'asdf');
    subject(() => Main.deleteTemplate($name));

    context('when the template does not exist', () => {
      beforeEach(() => {
        sinon.stub(Main, 'templateExists').returns(false);
      });

      it('does not prompt the user for anything', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.false;
      }));
    });

    context('when the template exists', () => {
      def('del', false);
      beforeEach(() => {
        sinon.stub(Main, 'templateExists').returns(true);
        inquirer.prompt.returns(Promise.resolve({ del: $del }));
      });

      it('prompts the user for confirmation', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.true;
        expect(inquirer.prompt.args[0][0][0]).to.include({
          type: 'confirm',
          name: 'del'
        });
      }));

      context('and the user confirms deleting the template', () => {
        def('del', true);

        it('deletes the template', () => $subject.then(() => {
          expect(Main.deleteTemplateFile.called).to.be.true;
          expect(Main.deleteTemplateFile.args[0][0]).to.include($name);
        }));
      });

      context('and the user does not confirm deleting the template', () => {
        def('del', false);

        it('deletes the template', () => $subject.then(() => {
          expect(Main.deleteTemplateFile.called).to.be.false;
        }));
      });
    });
  });

  describe('.run()', () => {
    subject(() => Main.run());

    beforeEach(() => {
      sinon.stub(Parser, 'parse').returns($parsedConfig);
      sinon.stub(applescript, 'execString');
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

  describe('.saveTemplate()', () => {
    def('localConfigExists', false);
    def('name', 'asdf');

    subject('saveTemplate', () => Main.saveTemplate($name));

    beforeEach(() => {
      sinon.stub(Main, 'localConfigExists').returns($localConfigExists);
      sinon.stub(Main, 'copyTemplateToLocal');
      inquirer.prompt.returns(Promise.resolve({ overwrite: $overwrite }));
    });

    context('when there is a local config', () => {
      def('overwrite', true);
      def('localConfigExists', true);

      it('prompts the user for confirmation', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.true;
        expect(inquirer.prompt.args[0][0][0]).to.include({
          type: 'confirm',
          name: 'overwrite'
        });
      }));

      context('and the user confirms overwriting the local config', () => {
        def('overwrite', true);
        it('copies the template', () => $subject.then(() => {
          expect(Main.copyTemplateToLocal.called).to.be.true;
        }));
      });

      context('and the user does not confirm overwriting the local config', () => {
        def('overwrite', false);

        it('does not copy the template', () => $subject.then(() => {
          expect(Main.copyTemplateToLocal.called).to.be.false;
        }));
      });
    });
  });
});
