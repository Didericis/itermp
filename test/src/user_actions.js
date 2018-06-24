const { expect } = require('chai'); 
const sinon = require('sinon');
const applescript = require('applescript');
const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');

const Parser = require('../../src/parser');
const Manager = require('../../src/manager');
const UserActions = require('../../src/user_actions');

describe('UserActions', () => {
  def('homedir', '/this/is/home');
  def('promptResults', {});
  def('manager', () => $userActions.manager);
  def('log', () => sinon.stub());
  subject('userActions', () => new UserActions($log));

  beforeEach(() => {
    sinon.stub(inquirer, 'prompt').returns(Promise.resolve($promptResults));
    sinon.stub(console, 'error');
    $userActions.manager = sinon.createStubInstance(Manager);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#createGlobalTemplate()', () => {
    def('localConfigExists', true);
    subject(() => $userActions.createGlobalTemplate($name));

    beforeEach(() => {
      $manager.localConfigExists.returns($localConfigExists);
    });

    context('when the local config does not exist', () => {
      def('localConfigExists', false);

      it('emits a console error', () => $subject.then(() => {
        expect(console.error.called).to.be.true;
      }));
    });

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
          $manager.templateExists.returns(true);
        });

        it('asks for confirmation', () => $subject.then(() => {
          expect(inquirer.prompt.args[0][0][0]).to.include({
            type: 'confirm',
            name: 'overwrite'
          });
        }));

        context('and the user confirms overwriting the template', () => {
          def('overwrite', true);
          it('creates the template from a local config', () => $subject.then(() => {
            expect($manager.createTemplateFromLocalConfig.calledWith($name)).to.be.true;
          }));
        });

        context('and the user does not confirm overwriting the template', () => {
          def('overwrite', false);
          it('does not copy the template', () => $subject.then(() => {
            expect($manager.createTemplateFromLocalConfig.called).to.be.false;
          }));
        });
      });
    });
  });

  describe('#removeTemplate()', () => {
    def('name', 'asdf');
    subject(() => $userActions.removeTemplate($name));

    context('when the template does not exist', () => {
      beforeEach(() => {
        $manager.templateExists.returns(false);
      });

      it('does not prompt the user for anything', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.false;
      }));
    });

    context('when the template exists', () => {
      def('remove', false);
      beforeEach(() => {
        $manager.templateExists.returns(true);
        inquirer.prompt.returns(Promise.resolve({ remove: $remove }));
      });

      it('prompts the user for confirmation', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.true;
        expect(inquirer.prompt.args[0][0][0]).to.include({
          type: 'confirm',
          name: 'remove'
        });
      }));

      context('and the user confirms removing the template', () => {
        def('remove', true);

        it('removes the template', () => $subject.then(() => {
          expect($manager.deleteTemplate.calledWith($name)).to.be.true;
        }));
      });

      context('and the user does not confirm deleting the template', () => {
        def('remove', false);

        it('removes the template', () => $subject.then(() => {
          expect($manager.deleteTemplate.called).to.be.false;
        }));
      });
    });
  });

  describe('#listTemplates()', () => {
    subject(() => $userActions.listTemplates());

    context('and there is no error getting the templates', () => {
      def('templates', ['asdf', 'asdf']);

      beforeEach(() => {
        $manager.getAllTemplates.returns(Promise.resolve($templates));
      });

      it('gets all templates', () => $subject.then(() => {
        expect($manager.getAllTemplates.called).to.be.true;
      }));

      it('prompts the user for templates and actions', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.true;
        expect(inquirer.prompt.args[0][0][0]).to.include({
          type: 'list',
          name: 'template',
        });
        expect(inquirer.prompt.args[0][0][0].choices).to.include(...$templates);
        expect(inquirer.prompt.args[0][0][1]).to.include({
          type: 'expand',
          name: 'action'
        });
      }));

      context('and the prompt action was remove', () => {
        def('removeTemplateResult', 'remove-result');
        def('promptResults', {
          action: 'remove',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'removeTemplate').returns(Promise.resolve($removeTemplateResult));
        });
        
        it('calls removeTemplate and returns the result', () => $subject.then((result) => {
          expect($userActions.removeTemplate.calledWith('my-template')).to.be.true;
          expect(result).to.eql($removeTemplateResult);
        }));
      });

      context('and the prompt action was execute', () => {
        def('executeResult', 'execute-result');
        def('promptResults', {
          action: 'execute',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'execute').returns(Promise.resolve($executeResult));
        });
        
        it('calls execute and returns the result', () => $subject.then((result) => {
          expect($userActions.execute.calledWith('my-template')).to.be.true;
          expect(result).to.eql($executeResult);
        }));
      });

      context('and the prompt action was save', () => {
        def('initTemplateResult', 'init-result');
        def('promptResults', {
          action: 'init',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'initTemplate').returns(Promise.resolve($initTemplateResult));
        });
        
        it('calls saveTemplate and returns the result', () => $subject.then((result) => {
          expect($userActions.initTemplate.calledWith('my-template')).to.be.true;
          expect(result).to.eql($initTemplateResult);
        }));
      });
    });
  });

  describe('#execute()', () => {
    def('parsedConfig', {});
    def('name', 'asdf');
    def('listTemplatesPromise', () => Promise.resolve());

    subject(() => $userActions.execute($name));

    beforeEach(() => {
      sinon.stub(Parser, 'parse').returns($parsedConfig);
      sinon.stub(applescript, 'execString');
      sinon.stub($userActions, 'listTemplates').returns($listTemplatesPromise);
    });

    const itBehavesLikeAConfigRunner = () => {
      it('loads the correct config', () => {
        $manager.loadConfig.returns(Promise.resolve());
        $subject;
        expect($manager.loadConfig.calledWith($name)).to.be.true;
      });

      context('and the config loads', () => {
        def('config', {});

        beforeEach(() => {
          $manager.loadConfig.returns(Promise.resolve($config));
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

        context('and there is no error executing the script', () => {
          beforeEach(() => {
            applescript.execString.callsArgWith(1, null);
          });

          it('does not throw an error', () => $subject.catch((e) => {
            expect(e).to.be.null;
          }));
        });
      });

      context('and the config does not load', () => {
        def('loadErr', () => new Error('Load error'));

        beforeEach(() => {
          $manager.loadConfig.returns(Promise.reject($loadErr));
        });

        it('rejects with the correct error', () => $subject.then(() => {
          expect(true, 'Expected to reject').to.be.false;
        }).catch(e => {
          expect(e).to.eql($loadErr);
        }));
      });
    };

    context('when no name is given', () => {
      def('name', undefined);

      context('and a local config does not exist', () => {
        beforeEach(() => {
          $manager.localConfigExists.returns(false);
        });

        it('lists the templates', () => $subject.then(() => {
          expect($subject).to.eql($listTemplatesPromise);
        }));

        it('does not load a config', () => $subject.then(() => {
          expect($manager.loadConfig.called).to.be.false;
        }));
      });

      context('and a local config exists', () => {
        beforeEach(() => {
          $manager.localConfigExists.returns(true);
        });

        itBehavesLikeAConfigRunner();
      });
    });

    context('when given a name', () => {
      def('name', 'asdf');

      itBehavesLikeAConfigRunner();
    });
  });

  describe('#initTemplate()', () => {
    def('localConfigExists', false);
    def('name', 'asdf');
    def('templateExists', true);

    subject(() => $userActions.initTemplate($name));

    beforeEach(() => {
      $manager.localConfigExists.returns($localConfigExists);
      $manager.templateExists.returns($templateExists);
      inquirer.prompt.returns(Promise.resolve({ overwrite: $overwrite }));
    });

    context('when there is not a local config', () => {
      def('localConfigExists', false);

      it('copies the template', () => $subject.then(() => {
        expect($manager.copyTemplateToLocalConfig.calledWith($name)).to.be.true;
      }));

      context('and no name is given', () => {
        def('name', undefined);

        it('initializes a local config', () => $subject.then(() => {
          expect($manager.initLocalConfig.called).to.be.true;
        }));
      });
    });

    context('when there is a local config', () => {
      def('localConfigExists', true);

      context('and the template does not exist', () => {
        def('templateExists', false);

        it('logs an error', () => $subject.then(() => {
          expect(console.error.called).to.be.true;
        }));
      });

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
          expect($manager.copyTemplateToLocalConfig.calledWith($name)).to.be.true;
        }));
      });

      context('and the user does not confirm overwriting the local config', () => {
        def('overwrite', false);

        it('does not copy the template', () => $subject.then(() => {
          expect($manager.copyTemplateToLocalConfig.called).to.be.false;
        }));
      });
    });
  });
});
