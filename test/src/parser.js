const { expect } = require('chai');

const Parser = require('../../src/parser');

describe('Parser', () => {
  describe('.parse()', () => {
    def('obj', {
      fullscreen: true,
      rows: 80,
      profile: 'Perdy',
      command: 'vi',
      split: [{
        type: 'horizontally',
        profile: 'Perdy Gear',
        rows: 15,
        command: 'npm run start:watch',
        split: {
          type: 'vertically',
          profile: 'Perdy Gear',
          command: 'npm run styleguide',
          split: {
            type: 'vertically',
            profile: 'Perdy Gear',
            command: 'npm run coverage',
          }
        }
      }, {
        type: 'vertically',
        profile: 'Perdy Coffee',
        columns: 30,
        command: 'npm run test:client:watch',
        split: [{
          type: 'horizontally',
          profile: 'Perdy',
        }]
      }]
    });
    subject('parse', () => Parser.parse($obj));

    it('creates the correct string', () => {
      expect($parse).to.include(`
tell application "iTerm"
  activate
  create window with profile "Perdy"
  tell current session of current window
    set rows to 80
    write text (dircommand as text)
    write text "vi"
    tell (split horizontally with profile "Perdy Gear")
      set rows to 15
      write text (dircommand as text)
      write text "npm run start:watch"
      tell (split vertically with profile "Perdy Gear")
        write text (dircommand as text)
        write text "npm run styleguide"
        tell (split vertically with profile "Perdy Gear")
          write text (dircommand as text)
          write text "npm run coverage"
        end tell
      end tell
    end tell
    tell (split vertically with profile "Perdy Coffee")
      set columns to 30
      write text (dircommand as text)
      write text "npm run test:client:watch"
      tell (split horizontally with profile "Perdy")
        write text (dircommand as text)
      end tell
    end tell
  end tell
end tell
tell application "System Events" to tell process "iTerm2"
  set value of attribute "AXFullScreen" of window 1 to true
end tell`
      );
    });
  });
});
