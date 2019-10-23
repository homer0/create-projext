const clear = require('clear');
const { provider } = require('jimple');
const minimist = require('minimist');
const { Spinner } = require('cli-spinner');
/**
 * This variable exists to avoid issues with the `no-magic-numbers` linting rule.
 * This is used on {@link CLI#_createHeader} as a default parameter value.
 * @ignore
 */
const HEADER_MIN_WIDTH = 32;
/**
 * The class in charge of handling the CLI of the application. It invokes the service
 * that makes the questions and the one that generate the results.
 */
class CLI {
  /**
   * @param {Generator}  generator  To generate the files after asking the user for information.
   * @param {Info}       info       To get information about the application. These are the
   *                                contents of the application's package.json file.
   * @param {Logger}     logger     To log messages on the console.
   * @param {Questions}  questions  To actually ask the questions to the user.
   * @param {Repository} repository To load the settings manifest that will be used to show the
   *                                options for engines and frameworks.
   * @param {Utils}      utils      To validate if the user is using Yarn or NPM and install
   *                                dependencies.
   */
  constructor(
    generator,
    info,
    logger,
    questions,
    repository,
    utils
  ) {
    /**
     * A local reference for the `generator` service.
     * @type {Generator}
     * @access protected
     * @ignore
     */
    this._generator = generator;
    /**
     * A local reference for the `info` service (the contents of the application's package.json
     * file).
     * @type {Info}
     * @access protected
     * @ignore
     */
    this._info = info;
    /**
     * A local reference for the `logger` service.
     * @type {Logger}
     * @access protected
     * @ignore
     */
    this._logger = logger;
    /**
     * A local reference for the `questions` service.
     * @type {Questions}
     * @access protected
     * @ignore
     */
    this._questions = questions;
    /**
     * A local reference for the `repository` service.
     * @type {Repository}
     * @access protected
     * @ignore
     */
    this._repository = repository;
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     * @access protected
     * @ignore
     */
    this._utils = utils;
    /**
     * A list of the {@link CLIHandler} that can prevent the user from triggering the questions.
     * For example: The help menu and the command to see the application's version.
     * @type {Array}
     * @access protected
     * @ignore
     */
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
    /**
     * A list of the {@link CLIOption} the user can send to the questions in order to set defaults
     * and speed up the process.
     * @type {Array}
     * @access protected
     * @ignore
     */
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
  /**
   * Start the CLI.
   * @return {Promise<undefined, Error>}
   */
  start() {
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
  /**
   * Shows the help menu on the console.
   * @access protected
   * @ignore
   */
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
  /**
   * Shows the application's version on the console.
   * @access protected
   * @ignore
   */
  _showVersion() {
    this._logger.log(this._info.version);
  }
  /**
   * Creates an array of lines that when printed on the console will show a table
   * with two columns, used to show the options of the CLI.
   * @return {Array}
   * @access protected
   * @ignore
   */
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
  /**
   * Creates an array of lines that when printed on the console will show a small title header
   * for the application's CLI.
   * @param {Number} [minWidth=32] The minimum width for the header.
   * @return {Array}
   * @access protected
   * @ignore
   */
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
  /**
   * This is the method that actually does the magic. It validates the options, defines the
   * default values, asks the questions and generate the files.
   * @param {Object} args The CLI arguments, parsed by {@link minimist}.
   * @return {Promise<undefined,Error>}
   * @access protected
   * @ignore
   */
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
  /**
   * Generates the structure of a target without having to ask the user for additional information.
   * This is used when the user sends the flag for 'quick mode'.
   * @param {ProjectAnswers} projectInfo The information about the project.
   * @param {CLIOptions}     options     The options parsed from the CLI arguments.
   * @return {TargetAnswer}
   * @access protected
   * @ignore
   */
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
  /**
   * Validates the options parsed from the CLI arguments and generate the default values for
   * the questions about the project.
   * @param {CLIOptions} options  The options parsed from the CLI arguments.
   * @param {?String}    [name]   A name for the project, sent as argument.
   * @return {ProjectAnswers}
   * @access protected
   * @ignore
   */
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
  /**
   * Parses the arguments sent to the CLI and generates a dictionary of boolean options.
   * @param {Array} args The arguments sent to the CLI.
   * @return {CLIOptions}
   * @access protected
   * @ignore
   */
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
/**
 * The service provider that once registered on the dependency injection container
 * will register an instance of {@link CLI} as the `cli` service.
 * @type {Provider}
 */
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
