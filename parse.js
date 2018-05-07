const _ = require('lodash');

const split = (obj) => [
  `tell (split ${obj.type} with profile "${obj.profile}")`,
  _.compact([
    obj.rows ? `set rows to ${obj.rows}` : null,
    obj.columns ? `set columns to ${obj.columns}` : null,
    'write text (dircommand as text)',
    obj.command ? `write text "${obj.command}"` : null,
    ...(() => {
      if (Array.isArray(obj.split)) return _.flatten(obj.split.map(s => split(s)));
      else if (obj.split) return split(obj.split);
      return [];
    })()
  ]),
  'end tell'
];

const indent = (arr, prefix = 0) =>
  arr.map((row) => {
    if (Array.isArray(row)) return indent(row, prefix + 2);
    const pre = prefix ? Array.apply(null, Array(prefix)).map(() => ' ').join('') : '';
    return pre + row;
  }).join('\n');

const parse = (obj) => 
`set dircommand to "cd ${process.cwd()}"

tell application "iTerm"
  activate
  create window with profile "${obj.profile}"
  tell current session of current window
    set rows to ${obj.rows}
    write text (dircommand as text)
    write text "${obj.command}"
${obj.split ? indent(obj.split.map(s => (split(s))), 2) : ''}
  end tell
${obj.fullscreen ?
indent([
	'tell application "System Events" to tell process "iTerm2"',
  ['set value of attribute "AXFullScreen" of window 1 to true'],
  'end tell'
], 2) : '' }
end tell
`;

module.exports = parse;
