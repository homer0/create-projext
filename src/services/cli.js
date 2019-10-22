const clear = require('clear');
const { provider } = require('jimple');
const minimist = require('minimist');
const { Spinner } = require('cli-spinner');

const HEADER_MIN_WIDTH = 32;

class CLI {
  constructor(
    generator,
    info,
    logger,
    questions,
    repository,
    utils
  ) {
    this._generator = generator;
    this._info = info;
    this._logger = logger;
    this._questions = questions;
    this._repository = repository;

    this._utils = utils;
    this._handlers = [
      {
        triggers: ['h', 'help'],
        fn: this._showHelp.bind(this),
      },
      {
        triggers: ['v', 'version'],
        fn: this._showVersion.bind(this),
      },
    ];
    this._options = [
      {
        triggers: ['r', 'rollup'],
        description: 'Use Rollup as build engine',
      },
      {
        triggers: ['c', 'config'],
        description: 'Create a configuration file for your targets',
      },
      {
        triggers: ['q', 'quick'],
        description: 'Create a single target project ASAP',
      },
      {
        triggers: ['n', 'node'],
        description: 'The target of quick mode must be for NodeJS',
      },
      {
        triggers: ['l', 'library'],
        description: 'The target of quick mode must be a library',
      },
      {
        triggers: ['t', 'typeScript'],
        description: 'The target of quick mode must use TypeScript',
      },
      {
        triggers: ['f', 'flow'],
        description: 'The target of quick mode must use Flow',
      },
      {
        triggers: ['react'],
        description: 'Install the React plugin',
      },
      {
        triggers: ['aurelia'],
        description: 'Install the Aurelia plugin (only available for webpack)',
      },
      {
        triggers: ['angularjs'],
        description: 'Install the AngularJS plugin',
      },
      {
        triggers: ['local'],
        description: 'Use the local manifest',
        hidden: true,
      },
    ];
  }

  run() {
    const cmdArgsPosition = 2;
    const args = minimist(process.argv.slice(cmdArgsPosition));
    const handler = this._handlers.find(({ triggers }) => (
      triggers.some((trigger) => args[trigger] === true)
    ));

    let result;
    if (handler) {
      handler.fn(args);
      result = Promise.resolve();
    } else {
      result = this._askQuestions(args);
    }

    return result;
  }

  _showHelp() {
    const bin = Object.keys(this._info.bin)[0].substr('create-'.length);
    const exec = this._utils.usesYarn() ? 'yarn create' : 'npm init';
    const lines = [
      '',
      'Usage:',
      '',
      `  ${exec} ${bin} [project-name] [options]`,
      '',
      'Options:',
      '',
      ...this._createOptionsTable(),
      '',
    ];

    lines.forEach((line) => this._logger.log(line));
  }

  _showVersion() {
    this._logger.log(this._info.version);
  }

  _createOptionsTable() {
    const useOptions = this._options
    .filter((option) => !option.hidden)
    .map((option) => Object.assign({}, option, {
      label: option.triggers.map((trigger) => (
        trigger.length === 1 ? `-${trigger}` : `--${trigger}`
      )).join(', '),
    }));

    const spacingAfterLabel = 2;
    const useWidth = useOptions.reduce(
      (currentWidth, option) => {
        const labelPlusSpacing = option.label.length + spacingAfterLabel;
        return labelPlusSpacing > currentWidth ?
          labelPlusSpacing :
          currentWidth;
      },
      0
    );

    return useOptions.map((option) => {
      const label = option.label.padEnd(useWidth, ' ');
      return `  ${label}${option.description}`;
    });
  }

  _createHeader(minWidth = HEADER_MIN_WIDTH) {
    const lines = [
      `Projext setup - v${this._info.version}`,
      this._info.homepage,
    ];
    const corners = 2;
    const spacing = 2;
    const hBorders = 2;
    const useWidth = lines.reduce(
      (currentWidth, line) => (
        line.length > currentWidth ?
          line.length :
          currentWidth
      ),
      minWidth
    );
    const useBorderWidth = useWidth - corners;
    const useBodyWidth = useWidth - spacing - hBorders;

    const vBorders = '-'.repeat(useBorderWidth);
    const vBordersLines = `+${vBorders}+`;
    const bodyLines = lines.map((line) => {
      const newLine = line.padEnd(useBodyWidth, ' ');
      return `| ${newLine} |`;
    });

    return [
      vBordersLines,
      ...bodyLines,
      vBordersLines,
    ];
  }

  _askQuestions(args) {
    clear();
    this._logger.log(this._createHeader());
    this._logger.log('');

    const { _: [nameFromArgs] } = args;
    const options = this._parseOptions(args);
    const defaults = this._parseDefaults(options, nameFromArgs);
    let manifest;
    let projectInfo;
    let targetsInfo;
    let spinner;
    return this._repository.getManifest(!!options.local)
    .then((response) => {
      manifest = response;
      this._questions.setEngines(manifest.engines);
      this._questions.setFrameworks(manifest.frameworks);
      return this._questions.askAboutTheProject(defaults);
    })
    .then((answers) => {
      projectInfo = answers;
      return options.quick ?
        [this._getQuickTarget(projectInfo, options)] :
        this._questions.askAboutTheTargets(projectInfo, options);
    })
    .then((answers) => {
      this._logger.log(['+ Generating files', '']);
      targetsInfo = answers;
      return this._generator.generateFiles(
        options.config,
        manifest,
        projectInfo,
        targetsInfo
      );
    })
    .then(() => {
      spinner = new Spinner('+ Installing project dependencies %s');
      spinner.setSpinnerString('|/-\\');
      spinner.start();
      return this._utils.installDependencies(projectInfo.path);
    })
    .then(() => {
      spinner.stop();
      this._logger.log(['', '', '+ DONE!', '']);
    })
    .catch((error) => {
      this._logger.error([
        'There was an error generating the project, please try again.',
        `If the issue persists, please open a ticket on ${this._repository.url}`,
        '',
      ]);

      return Promise.reject(error);
    });
  }

  _getQuickTarget(projectInfo, options) {
    const target = {
      type: options.node ? 'node' : 'browser',
      library: options.library,
    };

    if (projectInfo.framework) {
      target.framework = projectInfo.framework;
    }

    let types;
    if (options.typeScript) {
      types = 'typeScript';
    } else if (options.flow) {
      types = 'flow';
    } else {
      types = false;
    }

    target.types = types;
    return target;
  }

  _parseDefaults(options, name) {
    const result = {};
    if (options.angularjs) {
      result.framework = 'angularjs';
    } else if (options.aurelia) {
      result.framework = 'aurelia';
    } else if (options.react) {
      result.framework = 'react';
    }

    if (options.quick) {
      result.engine = options.rollup ? 'rollup' : 'webpack';
      result.targetsCount = 1;
      result.framework = result.framework || false;
    } else if (options.rollup) {
      result.engine = 'rollup';
    }

    if (name) {
      result.name = name;
    }

    return result;
  }

  _parseOptions(args) {
    return this._options.reduce(
      (acc, option) => {
        const name = option.triggers.find((trigger) => trigger.length > 1);
        const value = option.triggers.some((trigger) => args[trigger] === true);
        return Object.assign({}, acc, {
          [name]: value,
        });
      },
      {}
    );
  }
}

const cli = provider((app) => {
  app.set('cli', () => new CLI(
    app.get('generator'),
    app.get('info'),
    app.get('logger'),
    app.get('questions'),
    app.get('repository'),
    app.get('utils')
  ));
});

module.exports = {
  CLI,
  cli,
};
