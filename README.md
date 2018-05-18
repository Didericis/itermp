<a href="https://codeclimate.com/github/Didericis/itermproj/maintainability"><img src="https://api.codeclimate.com/v1/badges/f04fc0e128b4c26fb190/maintainability" /></a> <a href="https://codeclimate.com/github/Didericis/itermproj/test_coverage"><img src="https://api.codeclimate.com/v1/badges/f04fc0e128b4c26fb190/test_coverage" /></a> [![CircleCI](https://circleci.com/gh/Didericis/itermproj.svg?style=svg)](https://circleci.com/gh/Didericis/itermproj)
# itermp
This project is intended for iterm users that want project specific pane configurations. It's very similar to [itermocil](https://github.com/TomAnthony/itermocil), but offers more flexibility. Features include:

  - Local, project specific configurations
  - Ability to create arbitrary pane arrangements
  - Ability to run commands in opened panes
  - Ability to open in fullscreen

### Installation

```
npm install -g itermp
```

### Configuration options

`./itermp.json`
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


`./itermp.json`
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
  itermp completion     generate bash completion script
  itermp help           show help
  itermp [template]     run itermproj                            [default]

Options:
  -c, --create   Create pane configuration template from local itermproj.json
  -d, --debug    Emit more verbose errors
  -h, --help     Show help                                             [boolean]
  -l, --list     List available pane configurations
  -r, --remove   Remove pane configuration
  -s, --save     Save pane configuration to local itermproj.json
  -v, --version  Show version number                                   [boolean]
```
