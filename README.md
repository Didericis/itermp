# itermproj
This project is intended for heavy iterm users that want have project specific pane configurations. It's very similar to [itermocil](https://github.com/TomAnthony/itermocil), but offers more flexibility. Features include:

  - Local, project specific configurations
  - Ability to create arbitrary pane arrangements
  - Ability to run commands in opened panes
  - Ability to open in fullscreen

### Demo

![image](https://media.giphy.com/media/1zk6hML6QxUNAQ4l1j/giphy.gif)

### Installation

```
npm install -g itermproj
```

### Configuration options

```js
{
  "fullscreen": true,                    // only respected on the top level
  "profile": "Perdy",                    // iTerm session profile to use for the pane
  "rows": 20,                            // number of rows in for the pane
  "columns": 180,                        // number of columns for the pane,
  "command": "echo 'well hello there'",  // command to run when the pane opens
  "split": [{                            // split can either be an array or an object
    "type": "horizontally",              // can either be "horizontally" or "vertically"
    // ... can use pane configuration options from above and continue nesting
  }]
}
```

### Usage

```
Commands:
  itermproj                launch a local itermproj configuration
  itermproj <template>     launch the itermproj configuration template [default]
  itermproj completion     generate bash completion script

Options:
  --version     Show version number                                    [boolean]
  --delete, -d  Delete pane configuration
  --save, -s    Save pane configuration to local itermproj.json
  --list, -l    List available pane configurations
  --create, -c  Create pane configuration template from local itermproj.json
  --debug, -d   Emit more verbose errors
  -h, --help    Show help                                              [boolean]
```
