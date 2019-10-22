const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.mock('inquirer');
jest.unmock('/src/services/questions');

require('jasmine-expect');

const { Questions, questions } = require('/src/services/questions');
const fs = require('fs-extra');
const { prompt } = require('inquirer');

describe('service:Questions', () => {
  beforeEach(() => {
    JimpleMock.reset();
    prompt.mockClear();
    fs.pathExistsSync.mockClear();
  });

  describe('project', () => {
    it('should make questions about the project', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      const expectedQuestions = [
        {
          name: 'name',
          message: 'Project\'s name?',
          validate: expect.any(Function),
        },
        {
          name: 'engine',
          message: 'Build engine?',
          type: 'list',
          choices: [{
            name: engine.name,
            value: engine.id,
          }],
          default: engine.id,
        },
        {
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        },
        {
          name: 'targetsCount',
          message: 'How many targets?',
          type: 'list',
          choices: [
            { name: 1, value: 1 },
            { name: 2, value: 2 },
            { name: 3, value: 3 },
            { name: 4, value: 4 },
            { name: 5, value: 5 },
          ],
          default: 0,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject()
      .then((result) => {
        // Then
        expect(result).toEqual({
          name: answers.name,
          path: answers.name,
        });
        expect(pathUtils.join).toHaveBeenCalledTimes(1);
        expect(pathUtils.join).toHaveBeenCalledWith(answers.name);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '+ Project information',
          '',
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
      });
    });

    it('should ask for the project name and validate it', () => {
      // Given
      fs.pathExistsSync.mockImplementationOnce(() => false);
      fs.pathExistsSync.mockImplementationOnce(() => true);
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let validResult = null;
      let invalidDirectoryResult = null;
      let requiredResult = null;
      let invalidResult = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject()
      .then(() => {
        [[[question]]] = prompt.mock.calls;
        validResult = question.validate(answers.name);
        invalidDirectoryResult = question.validate(answers.name);
        requiredResult = question.validate();
        invalidResult = question.validate('~@#');
        // Then
        expect(question).toEqual({
          name: 'name',
          message: 'Project\'s name?',
          validate: expect.any(Function),
        });
        expect(validResult).toBeTrue();
        expect(invalidDirectoryResult).toMatch(/there's already a directory named '.*?'$/i);
        expect(requiredResult).toBe('The name is required');
        expect(invalidResult).toMatch(/the name '.*?' is invalid/i);
      });
    });

    it('should ask for a framework and calculate its options', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let shouldShow = null;
      let frameworksList = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject()
      .then(() => {
        [[[,, question]]] = prompt.mock.calls;
        shouldShow = question.when();
        frameworksList = question.choices({ engine: engine.id });
        // Then
        expect(question).toEqual({
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        });
        expect(shouldShow).toBeTrue();
        expect(frameworksList).toEqual([
          {
            name: 'Nop',
            value: false,
          },
          {
            name: framework.name,
            value: framework.id,
          },
        ]);
      });
    });

    it('should ask for a framework and calculate its options based on defaults', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        framework: framework.id,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let shouldShow = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .then(() => {
        [[[,, question]]] = prompt.mock.calls;
        shouldShow = question.when({
          engine: engine.id,
        });
        // Then
        expect(question).toEqual({
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        });
        expect(shouldShow).toBeFalse();
      });
    });

    it('should ask for a framework and calculate its options based on a default engine', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        framework: framework.id,
        engine: engine.id,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let shouldShow = null;
      let frameworksList = null;
      // When
      sut = new Questions(logger, pathUtils);
      // sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .then(() => {
        [[[, question]]] = prompt.mock.calls;
        shouldShow = question.when({});
        frameworksList = question.choices({});
        // Then
        expect(question).toEqual({
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        });
        expect(shouldShow).toBeFalse();
        expect(frameworksList).toEqual([
          {
            name: 'Nop',
            value: false,
          },
          {
            name: framework.name,
            value: framework.id,
          },
        ]);
      });
    });

    it('should ask for a framework and dismiss an invalid defaults', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        framework: 'some-thing',
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let shouldShow = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .then(() => {
        [[[,, question]]] = prompt.mock.calls;
        shouldShow = question.when({
          engine: engine.id,
        });
        // Then
        expect(question).toEqual({
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        });
        expect(shouldShow).toBeTrue();
      });
    });

    it('should ask for a framework and dismiss a framework unsupported by the engine', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: ['some-thing'],
      };
      const frameworks = [framework];
      const defaults = {
        framework: framework.id,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const answers = {
        name: 'awesome-project',
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let question = null;
      let shouldShow = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .then(() => {
        [[[,, question]]] = prompt.mock.calls;
        shouldShow = question.when({
          engine: engine.id,
        });
        // Then
        expect(question).toEqual({
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        });
        expect(shouldShow).toBeTrue();
      });
    });

    it('shouldn\'t make any questions and use the defaults', () => {
      // Given
      fs.pathExistsSync.mockImplementationOnce(() => false);
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        name: 'awesome-project',
        engine: engine.id,
        framework: framework.id,
        targetsCount: 1,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      let sut = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .then((result) => {
        // Then
        expect(result).toEqual(Object.assign(
          {},
          defaults,
          {
            path: defaults.name,
          }
        ));
        expect(pathUtils.join).toHaveBeenCalledTimes(2);
        expect(pathUtils.join).toHaveBeenCalledWith(defaults.name);
        expect(pathUtils.join).toHaveBeenCalledWith(defaults.name);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '+ Project information',
          '',
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith([{
          name: 'framework',
          message: 'Install a framework?',
          when: expect.any(Function),
          type: 'list',
          choices: expect.any(Function),
          default: false,
        }]);
      });
    });

    it('should throw an error if the default name is invalid', () => {
      // Given
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        name: '#awesome-project',
        engine: engine.id,
        framework: framework.id,
        targetsCount: 1,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      let sut = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .catch((error) => {
        // Then
        expect(error.message).toMatch(/the name '.*?' is invalid/i);
      });
    });

    it('should throw an error if a directory with the default name already exists', () => {
      // Given
      fs.pathExistsSync.mockImplementationOnce(() => true);
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const defaults = {
        name: 'awesome-project',
        engine: engine.id,
        framework: framework.id,
        targetsCount: 1,
      };
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      let sut = null;
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheProject(defaults)
      .catch((error) => {
        // Then
        expect(error.message).toMatch(/there's already a directory named '.*?'$/i);
      });
    });
  });

  describe('targets', () => {
    it('should ask the questions for a single target', () => {
      // Given
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const projectInfo = {
        targetsCount: 1,
      };
      const answers = {
        '0-done': true,
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      const expectedQuestions = [
        {
          name: '0-library',
          message: 'Target mode',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '0-types',
          message: 'Target types validation',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      return sut.askAboutTheTargets(projectInfo)
      .then((result) => {
        // Then
        expect(result).toEqual([
          {
            done: true,
          },
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '',
          '+ Target information',
          '',
        ]);
      });
    });

    it('should ask the questions for a single target with a framework', () => {
      // Given
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
      };
      const frameworks = [framework];
      const projectInfo = {
        targetsCount: 1,
        framework: framework.id,
      };
      const answers = {
        '0-done': true,
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      const expectedQuestions = [
        {
          name: '0-library',
          message: 'Target mode',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '0-types',
          message: 'Target types validation',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheTargets(projectInfo)
      .then((result) => {
        // Then
        expect(result).toEqual([
          {
            done: true,
            type: 'browser',
          },
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '',
          '+ Target information',
          '',
        ]);
      });
    });

    it('should ask the questions for a single target with SSR', () => {
      // Given
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
        ssr: true,
      };
      const frameworks = [framework];
      const projectInfo = {
        targetsCount: 1,
        framework: framework.id,
      };
      const answers = {
        '0-done': true,
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let frameworkQuestion = null;
      let showFrameworkWhenTypeIsNode = null;
      let showFrameworkWhenTypeIsBrowser = null;
      const expectedQuestions = [
        {
          name: '0-type',
          message: 'Target type',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: '0-framework',
          message: 'The target will do SSR?',
          when: expect.any(Function),
          type: 'confirm',
          default: false,
        },
        {
          name: '0-library',
          message: 'Target mode',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '0-types',
          message: 'Target types validation',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheTargets(projectInfo)
      .then((result) => {
        [[[, frameworkQuestion]]] = prompt.mock.calls;
        showFrameworkWhenTypeIsNode = frameworkQuestion.when({ '0-type': 'node' });
        showFrameworkWhenTypeIsBrowser = frameworkQuestion.when({ '0-type': 'browser' });
        // Then
        expect(result).toEqual([
          {
            done: true,
          },
        ]);
        expect(showFrameworkWhenTypeIsNode).toBeTrue();
        expect(showFrameworkWhenTypeIsBrowser).toBeFalse();
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '',
          '+ Target information',
          '',
        ]);
      });
    });

    it('should ask the questions for a multiple targets', () => {
      // Given
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const projectInfo = {
        targetsCount: 2,
      };
      const answers = {
        '0-done': true,
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let frameworkQuestion = null;
      let showFrameworkWhenTypeIsNode = null;
      let showFrameworkWhenTypeIsBrowser = null;
      const expectedQuestions = [
        {
          name: '0-name',
          message: 'Target name (1)',
          validate: expect.any(Function),
        },
        {
          name: '0-type',
          message: 'Target type (1)',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: '0-framework',
          message: expect.any(String),
          when: expect.any(Function),
          type: 'confirm',
          default: false,
        },
        {
          name: '0-library',
          message: 'Target mode (1)',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '0-types',
          message: 'Target types validation (1)',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
        {
          name: '1-name',
          message: 'Target name (2)',
          validate: expect.any(Function),
        },
        {
          name: '1-type',
          message: 'Target type (2)',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: '1-framework',
          message: expect.any(String),
          when: expect.any(Function),
          type: 'confirm',
          default: false,
        },
        {
          name: '1-library',
          message: 'Target mode (2)',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '1-types',
          message: 'Target types validation (2)',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      return sut.askAboutTheTargets(projectInfo)
      .then((result) => {
        [[[,, frameworkQuestion]]] = prompt.mock.calls;
        showFrameworkWhenTypeIsBrowser = frameworkQuestion.when({ '0-type': 'browser' });
        showFrameworkWhenTypeIsNode = frameworkQuestion.when({ '0-type': 'node' });
        // Then
        expect(result).toEqual([
          {
            done: true,
          },
        ]);
        expect(showFrameworkWhenTypeIsBrowser).toBeFalse();
        expect(showFrameworkWhenTypeIsNode).toBeFalse();
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '',
          '+ Targets information',
          '',
        ]);
      });
    });

    it('should ask the questions for a multiple targets with SSR', () => {
      // Given
      const logger = {
        log: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((rest) => rest),
      };
      const engine = {
        id: 'webpack',
        name: 'webpack',
        default: true,
      };
      const engines = [engine];
      const framework = {
        id: 'react',
        engines: [engine.id],
        ssr: true,
      };
      const frameworks = [framework];
      const projectInfo = {
        targetsCount: 2,
        framework: framework.id,
      };
      const answers = {
        '0-done': true,
      };
      prompt.mockImplementationOnce(() => Promise.resolve(answers));
      let sut = null;
      let frameworkQuestion = null;
      let showFrameworkWhenTypeIsNode = null;
      let showFrameworkWhenTypeIsBrowser = null;
      const expectedQuestions = [
        {
          name: '0-name',
          message: 'Target name (1)',
          validate: expect.any(Function),
        },
        {
          name: '0-type',
          message: 'Target type (1)',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: '0-framework',
          message: expect.any(String),
          when: expect.any(Function),
          type: 'confirm',
          default: false,
        },
        {
          name: '0-library',
          message: 'Target mode (1)',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '0-types',
          message: 'Target types validation (1)',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
        {
          name: '1-name',
          message: 'Target name (2)',
          validate: expect.any(Function),
        },
        {
          name: '1-type',
          message: 'Target type (2)',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: '1-framework',
          message: expect.any(String),
          when: expect.any(Function),
          type: 'confirm',
          default: false,
        },
        {
          name: '1-library',
          message: 'Target mode (2)',
          type: 'list',
          choices: [
            {
              name: 'App',
              value: false,
            },
            {
              name: 'Library',
              value: true,
            },
          ],
          default: false,
        },
        {
          name: '1-types',
          message: 'Target types validation (2)',
          type: 'list',
          choices: [
            {
              name: 'Nop',
              value: false,
            },
            {
              name: 'TypeScript',
              value: 'typeScript',
            },
            {
              name: 'Flow',
              value: 'flow',
            },
          ],
          default: false,
        },
      ];
      // When
      sut = new Questions(logger, pathUtils);
      sut.setEngines(engines);
      sut.setFrameworks(frameworks);
      return sut.askAboutTheTargets(projectInfo)
      .then((result) => {
        [[[,, frameworkQuestion]]] = prompt.mock.calls;
        showFrameworkWhenTypeIsBrowser = frameworkQuestion.when({ '0-type': 'browser' });
        showFrameworkWhenTypeIsNode = frameworkQuestion.when({ '0-type': 'node' });
        // Then
        expect(result).toEqual([
          {
            done: true,
          },
        ]);
        expect(showFrameworkWhenTypeIsBrowser).toBeTrue();
        expect(showFrameworkWhenTypeIsNode).toBeTrue();
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith(expectedQuestions);
        expect(logger.log).toHaveBeenCalledTimes(1);
        expect(logger.log).toHaveBeenCalledWith([
          '',
          '+ Targets information',
          '',
        ]);
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
      const expectedGets = ['logger', 'pathUtils'];
      // When
      questions(container);
      [[serviceName, serviceFn]] = container.set.mock.calls;
      sut = serviceFn();
      // Then
      expect(serviceName).toBe('questions');
      expect(serviceFn).toBeFunction();
      expect(sut).toBeInstanceOf(Questions);
      expect(container.set).toHaveBeenCalledTimes(1);
      expect(container.set).toHaveBeenCalledWith('questions', expect.any(Function));
      expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
      expectedGets.forEach((service) => {
        expect(container.get).toHaveBeenCalledWith(service);
      });
    });
  });
});
