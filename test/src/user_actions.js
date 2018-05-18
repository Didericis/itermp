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
    $userActions.manager = sinon.createStubInstance(Manager);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#createTemplate()', () => {
    subject(() => $userActions.createTemplate($name));

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

      context('and the template templateExists', () => {
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
          it('copies the template', () => $subject.then(() => {
            expect($manager.copyTemplateToLocalConfig.calledWith($name)).to.be.true;
          }));
        });

        context('and the user does not confirm overwriting the template', () => {
          def('overwrite', false);
          it('does not copy the template', () => $subject.then(() => {
            expect($manager.copyTemplateToLocalConfig.called).to.be.false;
          }));
        });
      });
    });
  });

  describe('#deleteTemplate()', () => {
    def('name', 'asdf');
    subject(() => $userActions.deleteTemplate($name));

    context('when the template does not exist', () => {
      beforeEach(() => {
        $manager.templateExists.returns(false);
      });

      it('does not prompt the user for anything', () => $subject.then(() => {
        expect(inquirer.prompt.called).to.be.false;
      }));
    });

    context('when the template templateExists', () => {
      def('del', false);
      beforeEach(() => {
        $manager.templateExists.returns(true);
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
          expect($manager.deleteTemplate.calledWith($name)).to.be.true;
        }));
      });

      context('and the user does not confirm deleting the template', () => {
        def('del', false);

        it('deletes the template', () => $subject.then(() => {
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

      context('and the prompt action was delete', () => {
        def('deleteTemplateResult', 'delete-result');
        def('promptResults', {
          action: 'delete',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'deleteTemplate').returns(Promise.resolve($deleteTemplateResult));
        });
        
        it('calls and returns deleteTemplate result', () => $subject.then((result) => {
          expect($userActions.deleteTemplate.calledWith('my-template')).to.be.true;
          expect(result).to.eql($deleteTemplateResult);
        }));
      });

      context('and the prompt action was run', () => {
        def('runResult', 'run-result');
        def('promptResults', {
          action: 'run',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'run').returns(Promise.resolve($runResult));
        });
        
        it('calls and returns run result', () => $subject.then((result) => {
          expect($userActions.run.calledWith('my-template')).to.be.true;
          expect(result).to.eql($runResult);
        }));
      });

      context('and the prompt action was save', () => {
        def('saveTemplateResult', 'save-result');
        def('promptResults', {
          action: 'save',
          template: 'my-template',
        });

        beforeEach(() => {
          sinon.stub($userActions, 'saveTemplate').returns(Promise.resolve($saveTemplateResult));
        });
        
        it('calls and returns saveTemplate result', () => $subject.then((result) => {
          expect($userActions.saveTemplate.calledWith('my-template')).to.be.true;
          expect(result).to.eql($saveTemplateResult);
        }));
      });
    });
  });

  describe('#run()', () => {
    def('parsedConfig', {});
    def('name', 'asdf');
    def('listTemplatesPromise', () => Promise.resolve());

    subject(() => $userActions.run($name));

    beforeEach(() => {
      sinon.stub(Parser, 'parse').returns($parsedConfig);
      sinon.stub(applescript, 'execString');
      sinon.stub($userActions, 'listTemplates').returns($listTemplatesPromise);
    });

    const itBehavesLikeAConfigRunner = () => {
      context('and the config loads', () => {
        def('config', {});

        beforeEach(() => {
          $manager.loadLocalConfig.returns(Promise.resolve($config));
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
        def('loadErr', new Error('Bad load'));

        beforeEach(() => {
          $manager.loadLocalConfig.returns(Promise.reject($loadErr));
        });

        it('rejects the config error', () => $subject.then(() => {
          expect(true, 'Expected to reject').to.be.false;
        }).catch(e => {
          expect(e).to.eql($loadErr);
        }));
      });
    };

    context('when not given a name', () => {
      def('name', undefined);

      context('and a local config does not exist', () => {
        beforeEach(() => {
          $manager.localConfigExists.returns(false);
        });

        it('lists the templates', () => $subject.then(() => {
          expect($subject).to.eql($listTemplatesPromise);
        }));
      });

      context('and a local config templateExists', () => {
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

  describe('#saveTemplate()', () => {
    def('localConfigExists', false);
    def('name', 'asdf');

    subject('saveTemplate', () => $userActions.saveTemplate($name));

    beforeEach(() => {
      $manager.localConfigExists.returns($localConfigExists);
      inquirer.prompt.returns(Promise.resolve({ overwrite: $overwrite }));
    });

    context('when tere is not a local config', () => {
      def('localConfigExists', false);

      it('copies the template', () => $subject.then(() => {
        expect($manager.copyTemplateToLocalConfig.calledWith($name)).to.be.true;
      }));
    });

    context('when there is a local config', () => {
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

  describe('#log()', () => {
    context('when a logger is given', () => {
      def('log', () => sinon.stub());

      it('uses the given logger', () => {
        expect($subject.log).to.equal($log);
      });
    });

    context('when no logger is given', () => {
      def('log', () => undefined);

      it('uses console.log', () => {
        expect($subject.log).to.equal(console.log);
      });
    });
  });
});
