# itermproj
This project is intended for iterm users that want project specific pane configurations. It's very similar to [itermocil](https://github.com/TomAnthony/itermocil), but offers more flexibility. Features include:

  - Local, project specific configurations
  - Ability to create arbitrary pane arrangements
  - Ability to run commands in opened panes
  - Ability to open in fullscreen

### Installation

```
npm install -g itermproj
```

### Configuration options

`./itermproj.json`
```js
{
  "fullscreen": true,                    // makes iTerm window fullscreen
  "profile": "Perdy",                    // iTerm session profile to use for the pane
  "rows": 20,                            // number of rows in for the pane
  "columns": 180,                        // number of columns for the pane,
  "command": "echo 'well hello there'",  // command to run when the pane opens
  "split": [{                            // split can either be an array or an object
    "type": "horizontally",              // can either be "horizontally" or "vertically"
    // ... can use pane configuration options from above (except fullscreen) and continue nesting
  }]
}
```

### Demo/Example

![image](https://media.giphy.com/media/1zk6hML6QxUNAQ4l1j/giphy.gif)


`./itermproj.json`
```js
{
  "fullscreen": true,
  "profile": "Perdy",
  "rows": 80,
  "columns": 400,
  "command": "vi",
  "split": [{
    "type": "horizontally",
    "profile": "Perdy Gears",
    "rows": 30,
    "command": "npm run start:watch",
    "split": {
      "type": "vertically",
      "profile": "Perdy Gears",
      "command": "npm run styleguide",
      "split": {
        "type": "vertically",
        "profile": "Perdy Gears",
        "command": "npm run coverage"
      }
    }
  },
  {
    "type": "vertically",
    "profile": "Perdy Coffee",
    "columns": 120,
    "command": "npm run test:client:watch",
    "split": {
      "type": "horizontally",
      "profile": "Perdy"
    }
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
