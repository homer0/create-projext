# create-projext

[![Travis](https://img.shields.io/travis/homer0/create-projext.svg?style=flat-square)](https://travis-ci.org/homer0/create-projext)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/create-projext.svg?style=flat-square)](https://coveralls.io/github/homer0/create-projext?branch=master)
[![David](https://img.shields.io/david/homer0/create-projext.svg?style=flat-square)](https://david-dm.org/homer0/create-projext)
[![David](https://img.shields.io/david/dev/homer0/create-projext.svg?style=flat-square)](https://david-dm.org/homer0/create-projext)

Setup projext using npm init or yarn create

## Introduction

This application allows anyone to use the `npm init` and `yarn create` "shortcut tasks" to initialise a new project with projext.

## Usage

If you are using npm:

```bash
npm init projext [project-name] [options]
```

And if you are using Yarn:

```bash
yarn create projext [project-name] [options]
```

> Both the `project-name` and the `options` are optional.

And that's all, the application will ask you a few questions about the features you want and the settings for your targets; after that, it will write the files and install the dependencies so you can start coding right away.

### Options

The application has several options that allows you to speed up and customize the whole process:

| Option               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `-r`, `--rollup`     | Use Rollup as build engine                               |
| `-c`, `--config`     | Create a configuration file for your targets             |
| `-q`, `--quick`      | Create a single target project ASAP                      |
| `-n`, `--node`       | The target of quick mode must be for NodeJS              |
| `-l`, `--library`    | The target of quick mode must be a library               |
| `-t`, `--typeScript` | The target of quick mode must use TypeScript             |
| `-f`, `--flow`       | The target of quick mode must use Flow                   |
| `--react`            | Install the React plugin                                 |
| `--aurelia`          | Install the Aurelia plugin (only available for webpack)  |
| `--angularjs`        | Install the AngularJS plugin                             |

## Development

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `yarn test`             | Run the project unit tests.         |
| `yarn run lint`         | Lint the modified files.            |
| `yarn run lint:full`    | Lint the project code.              |
| `yarn run docs`         | Generate the project documentation. |
| `yarn run todo`         | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
