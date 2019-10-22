const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('minimist');
jest.mock('cli-spinner');
jest.mock('clear');
jest.unmock('/src/services/cli');

require('jasmine-expect');

const { CLI, cli } = require('/src/services/cli');
const minimist = require('minimist');
const { Spinner } = require('cli-spinner');
const clear = require('clear');

describe('service:CLI', () => {
  beforeEach(() => {
    JimpleMock.reset();
    minimist.mockClear();
    Spinner.mockClear();
    clear.mockClear();
  });

  describe('Version', () => {
    it('should log the program version', () => {
      // Given
      const generator = 'generator';
      const info = {
        version: 'magic!',
      };
      const logger = {
        log: jest.fn(),
      };
      const questions = 'questions';
      const repository = 'repository';
      const utils = 'utils';
      minimist.mockImplementationOnce(() => ({
        version: true,
      }));
      let sut = null;
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      sut.run()
      .then(() => {
        // Then
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith(info.version);
      });
    });
  });

  describe('Help', () => {
    it('should log the help menu for npm', () => {
      // Given
      const generator = 'generator';
      const info = {
        bin: {
          'create-projext': '...',
        },
      };
      const logger = {
        log: jest.fn(),
      };
      const questions = 'questions';
      const repository = 'repository';
      const usesYarn = false;
      const utils = {
        usesYarn: jest.fn(() => usesYarn),
      };
      minimist.mockImplementationOnce(() => ({
        help: true,
      }));
      const expectedLog = [
        '',
        'Usage:',
        '',
        '  npm init projext [project-name] [options]',
        '',
        'Options:',
        '',
        '  -r, --rollup      Use Rollup as build engine',
        '  -c, --config      Create a configuration file for your targets',
        '  -q, --quick       Create a single target project ASAP',
        '  -n, --node        The target of quick mode must be for NodeJS',
        '  -l, --library     The target of quick mode must be a library',
        '  -t, --typeScript  The target of quick mode must use TypeScript',
        '  -f, --flow        The target of quick mode must use Flow',
        '  --react           Install the React plugin',
        '  --aurelia         Install the Aurelia plugin (only available for webpack)',
        '  --angularjs       Install the AngularJS plugin',
        '',
      ];
      let sut = null;
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      sut.run()
      .then(() => {
        // Then
        expect(logger.log).toHaveBeenCalledTimes(expectedLog.length);
        expectedLog.forEach((line) => {
          expect(logger.log).toHaveBeenCalledWith(line);
        });
      });
    });

    it('should log the help menu for Yarn', () => {
      // Given
      const generator = 'generator';
      const info = {
        bin: {
          'create-projext': '...',
        },
      };
      const logger = {
        log: jest.fn(),
      };
      const questions = 'questions';
      const repository = 'repository';
      const usesYarn = true;
      const utils = {
        usesYarn: jest.fn(() => usesYarn),
      };
      minimist.mockImplementationOnce(() => ({
        help: true,
      }));
      const expectedLog = [
        '',
        'Usage:',
        '',
        '  yarn create projext [project-name] [options]',
        '',
        'Options:',
        '',
        '  -r, --rollup      Use Rollup as build engine',
        '  -c, --config      Create a configuration file for your targets',
        '  -q, --quick       Create a single target project ASAP',
        '  -n, --node        The target of quick mode must be for NodeJS',
        '  -l, --library     The target of quick mode must be a library',
        '  -t, --typeScript  The target of quick mode must use TypeScript',
        '  -f, --flow        The target of quick mode must use Flow',
        '  --react           Install the React plugin',
        '  --aurelia         Install the Aurelia plugin (only available for webpack)',
        '  --angularjs       Install the AngularJS plugin',
        '',
      ];
      let sut = null;
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(logger.log).toHaveBeenCalledTimes(expectedLog.length);
        expectedLog.forEach((line) => {
          expect(logger.log).toHaveBeenCalledWith(line);
        });
      });
    });
  });

  describe('Questions', () => {
    it('should ask the questions and generate a project', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'charito.homer0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const targetsAnswers = [];
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn(() => Promise.resolve(projectAnswers)),
        askAboutTheTargets: jest.fn(() => Promise.resolve(targetsAnswers)),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: false,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: false,
        react: false,
        rollup: false,
        typeScript: false,
      };
      const expectedLog = [
        [
          '+------------------------------+',
          `| Projext setup - v${info.version}  |`,
          `| ${info.homepage}               |`,
          '+------------------------------+',
        ],
        '',
        [
          '+ Generating files',
          '',
        ],
        [
          '',
          '',
          '+ DONE!',
          '',
        ],
      ];
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith({});
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheTargets).toHaveBeenCalledWith(
          projectAnswers,
          expectedOptions
        );
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          projectAnswers,
          targetsAnswers
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(projectAnswers.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledTimes(expectedLog.length);
        expectedLog.forEach((line) => {
          expect(logger.log).toHaveBeenCalledWith(line);
        });
      });
    });

    it('should recive the project name and engine from the arguments', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'charito.homer0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const targetsAnswers = [];
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(() => Promise.resolve(targetsAnswers)),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      const projectName = 'My awesome project';
      minimist.mockImplementationOnce(() => ({
        _: [projectName],
        r: true, // Rollup
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: false,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: false,
        react: false,
        rollup: true,
        typeScript: false,
      };
      const expectedProjectDefaults = {
        name: projectName,
        engine: 'rollup',
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheTargets).toHaveBeenCalledWith(
          expectedProject,
          expectedOptions
        );
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          targetsAnswers
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
      });
    });

    it('should fail to generate a project', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'charito.homer0',
      };
      const logger = {
        log: jest.fn(),
        error: jest.fn(),
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn(),
        askAboutTheTargets: jest.fn(),
      };
      const error = new Error('Something went wrong!!!');
      const repository = {
        getManifest: jest.fn(() => Promise.reject(error)),
      };
      const utils = {
        installDependencies: jest.fn(),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
      }));
      let sut = null;
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .catch((result) => {
        // Then
        expect(result).toBe(error);
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith([
          expect.any(String),
          expect.any(String),
          '',
        ]);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledTimes(0);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(0);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(0);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(0);
        expect(Spinner).toHaveBeenCalledTimes(0);
        expect(utils.installDependencies).toHaveBeenCalledTimes(0);
      });
    });

    it('should generate a project with a target', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'some really reaaaally looooong homepage URL',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
        q: true, // quick
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: false,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: true,
        react: false,
        rollup: false,
        typeScript: false,
      };
      const expectedTargets = [
        {
          type: 'browser',
          types: false,
          library: false,
        },
      ];
      const expectedProjectDefaults = {
        engine: 'webpack',
        framework: false,
        targetsCount: 1,
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      const expectedLog = [
        [
          '+-----------------------------------------+',
          `| Projext setup - v${info.version}             |`,
          `| ${info.homepage} |`,
          '+-----------------------------------------+',
        ],
        '',
        [
          '+ Generating files',
          '',
        ],
        [
          '',
          '',
          '+ DONE!',
          '',
        ],
      ];
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          expectedTargets
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledTimes(expectedLog.length);
        expectedLog.forEach((line) => {
          expect(logger.log).toHaveBeenCalledWith(line);
        });
      });
    });

    it('should generate a project with a Node target', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'v1.0.0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
        q: true, // quick
        n: true, // Node
        f: true, // Flow
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: false,
        config: false,
        flow: true,
        library: false,
        local: false,
        node: true,
        quick: true,
        react: false,
        rollup: false,
        typeScript: false,
      };
      const expectedTargets = [
        {
          type: 'node',
          types: 'flow',
          library: false,
        },
      ];
      const expectedProjectDefaults = {
        engine: 'webpack',
        framework: false,
        targetsCount: 1,
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          expectedTargets
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
      });
    });

    it('should generate a project with an Aurelia target', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'v1.0.0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
        q: true, // quick
        t: true, // typeScript
        aurelia: true,
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: true,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: true,
        react: false,
        rollup: false,
        typeScript: true,
      };
      const expectedTargets = [
        {
          type: 'browser',
          framework: 'aurelia',
          types: 'typeScript',
          library: false,
        },
      ];
      const expectedProjectDefaults = {
        engine: 'webpack',
        framework: 'aurelia',
        targetsCount: 1,
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          expectedTargets
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
      });
    });

    it('should generate a project with an AngularJS target', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'v1.0.0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
        q: true, // quick
        angularjs: true,
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: true,
        aurelia: false,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: true,
        react: false,
        rollup: false,
        typeScript: false,
      };
      const expectedTargets = [
        {
          type: 'browser',
          framework: 'angularjs',
          types: false,
          library: false,
        },
      ];
      const expectedProjectDefaults = {
        engine: 'webpack',
        framework: 'angularjs',
        targetsCount: 1,
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          expectedTargets
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
      });
    });

    it('should generate a project with a React target and Rollup', () => {
      // Given
      const generator = {
        generateFiles: jest.fn(() => Promise.resolve()),
      };
      const info = {
        version: '06.09.2019',
        homepage: 'v1.0.0',
      };
      const logger = {
        log: jest.fn(),
      };
      const projectAnswers = {
        name: 'awesome-project',
        path: 'awesome-project-path',
      };
      const questions = {
        setEngines: jest.fn(),
        setFrameworks: jest.fn(),
        askAboutTheProject: jest.fn((defaults) => Promise.resolve(Object.assign(
          {},
          defaults,
          projectAnswers
        ))),
        askAboutTheTargets: jest.fn(),
      };
      const manifest = {
        hello: 'world',
        engines: 'da engines!',
        frameworks: 'da farmeworks!',
      };
      const repository = {
        getManifest: jest.fn(() => Promise.resolve(manifest)),
      };
      const utils = {
        installDependencies: jest.fn(() => Promise.resolve()),
      };
      minimist.mockImplementationOnce(() => ({
        _: [],
        q: true, // quick
        r: true, // Rollup
        l: true, // library
        react: true,
      }));
      const spinner = {
        setSpinnerString: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      Spinner.mockImplementationOnce(() => spinner);
      let sut = null;
      const expectedOptions = {
        angularjs: false,
        aurelia: false,
        config: false,
        flow: false,
        library: false,
        local: false,
        node: false,
        quick: true,
        react: true,
        rollup: true,
        typeScript: false,
      };
      const expectedTargets = [
        {
          type: 'browser',
          framework: 'react',
          types: false,
          library: true,
        },
      ];
      const expectedProjectDefaults = {
        engine: 'rollup',
        framework: 'react',
        targetsCount: 1,
      };
      const expectedProject = Object.assign(
        {},
        expectedProjectDefaults,
        projectAnswers
      );
      // When
      sut = new CLI(
        generator,
        info,
        logger,
        questions,
        repository,
        utils
      );
      return sut.run()
      .then(() => {
        // Then
        expect(clear).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledTimes(1);
        expect(repository.getManifest).toHaveBeenCalledWith(expectedOptions.local);
        expect(questions.setEngines).toHaveBeenCalledTimes(1);
        expect(questions.setEngines).toHaveBeenCalledWith(manifest.engines);
        expect(questions.setFrameworks).toHaveBeenCalledTimes(1);
        expect(questions.setFrameworks).toHaveBeenCalledWith(manifest.frameworks);
        expect(questions.askAboutTheProject).toHaveBeenCalledTimes(1);
        expect(questions.askAboutTheProject).toHaveBeenCalledWith(expectedProjectDefaults);
        expect(questions.askAboutTheTargets).toHaveBeenCalledTimes(0);
        expect(generator.generateFiles).toHaveBeenCalledTimes(1);
        expect(generator.generateFiles).toHaveBeenCalledWith(
          expectedOptions.config,
          manifest,
          expectedProject,
          expectedTargets
        );
        expect(Spinner).toHaveBeenCalledTimes(1);
        expect(Spinner).toHaveBeenCalledWith('+ Installing project dependencies %s');
        expect(spinner.setSpinnerString).toHaveBeenCalledTimes(1);
        expect(spinner.setSpinnerString).toHaveBeenCalledWith('|/-\\');
        expect(spinner.start).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledTimes(1);
        expect(utils.installDependencies).toHaveBeenCalledWith(expectedProject.path);
        expect(spinner.stop).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('provider', () => {
    it('should include a provider for the DIC', () => {
      // Given
      let sut = null;
      const container = {
        set: jest.fn(),
        get: jest.fn((service) => service),
      };
      let serviceName = null;
      let serviceFn = null;
      const expectedGets = [
        'generator',
        'info',
        'logger',
        'questions',
        'repository',
        'utils',
      ];
      // When
      cli(container);
      [[serviceName, serviceFn]] = container.set.mock.calls;
      sut = serviceFn();
      // Then
      expect(serviceName).toBe('cli');
      expect(serviceFn).toBeFunction();
      expect(sut).toBeInstanceOf(CLI);
      expect(container.set).toHaveBeenCalledTimes(1);
      expect(container.set).toHaveBeenCalledWith('cli', expect.any(Function));
      expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
      expectedGets.forEach((service) => {
        expect(container.get).toHaveBeenCalledWith(service);
      });
    });
  });
});
