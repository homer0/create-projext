const JimpleMock = require('/tests/mocks/jimple.mock');
const SpawnMock = require('/tests/mocks/spawn.mock');
require('child_process').spawn = SpawnMock.spawn;

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/utils');

require('jasmine-expect');

const { Utils, utils } = require('/src/services/utils');

describe('service:Utils', () => {
  beforeEach(() => {
    JimpleMock.reset();
    SpawnMock.reset();
  });

  describe('usesYarn', () => {
    it('should detect the user uses Yarn', () => {
      // Given
      const execPath = '/usr/bin/yarn.js';
      const environmentUtils = {
        get: jest.fn(() => execPath),
      };
      let sut = null;
      let result = null;
      // When
      sut = new Utils(environmentUtils);
      result = sut.usesYarn();
      // Then
      expect(result).toBeTrue();
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith('npm_execpath');
    });

    it('should detect the user uses npm', () => {
      // Given
      const execPath = '/usr/bin/npm.js';
      const environmentUtils = {
        get: jest.fn(() => execPath),
      };
      let sut = null;
      let result = null;
      // When
      sut = new Utils(environmentUtils);
      result = sut.usesYarn();
      // Then
      expect(result).toBeFalse();
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith('npm_execpath');
    });
  });

  describe('installDependencies', () => {
    it('should install a project dependencies using Yarn', () => {
      // Given
      const execPath = '/usr/bin/yarn.js';
      const environmentUtils = {
        get: jest.fn(() => execPath),
      };
      const projectPath = '/some/project/path';
      let sut = null;
      let installation = null;
      let exitHandler = null;
      // When
      sut = new Utils(environmentUtils);
      installation = sut.installDependencies(projectPath);
      [[, exitHandler]] = SpawnMock.mocks.once.mock.calls;
      exitHandler();
      return installation
      .then(() => {
        // Then
        expect(SpawnMock.mocks.spawn).toHaveBeenCalledTimes(1);
        expect(SpawnMock.mocks.spawn).toHaveBeenCalledWith(
          'yarn',
          [],
          {
            shell: true,
            stdio: 'ignore',
            cwd: projectPath,
          }
        );
        expect(SpawnMock.mocks.once).toHaveBeenCalledTimes(['exit', 'error'].length);
        expect(SpawnMock.mocks.once).toHaveBeenCalledWith(
          'exit',
          expect.any(Function)
        );
        expect(SpawnMock.mocks.once).toHaveBeenCalledWith(
          'error',
          expect.any(Function)
        );
        expect(SpawnMock.mocks.kill).toHaveBeenCalledTimes(1);
        expect(SpawnMock.mocks.kill).toHaveBeenCalledWith('SIGINT');
      });
    });

    it('should install a project dependencies using npm', () => {
      // Given
      const execPath = '/usr/bin/npm.js';
      const environmentUtils = {
        get: jest.fn(() => execPath),
      };
      const projectPath = '/some/project/path';
      let sut = null;
      let installation = null;
      let exitHandler = null;
      // When
      sut = new Utils(environmentUtils);
      installation = sut.installDependencies(projectPath);
      [[, exitHandler]] = SpawnMock.mocks.once.mock.calls;
      exitHandler();
      return installation
      .then(() => {
        // Then
        expect(SpawnMock.mocks.spawn).toHaveBeenCalledTimes(1);
        expect(SpawnMock.mocks.spawn).toHaveBeenCalledWith(
          'npm',
          ['install'],
          {
            shell: true,
            stdio: 'ignore',
            cwd: projectPath,
          }
        );
        expect(SpawnMock.mocks.once).toHaveBeenCalledTimes(['exit', 'error'].length);
        expect(SpawnMock.mocks.once).toHaveBeenCalledWith(
          'exit',
          expect.any(Function)
        );
        expect(SpawnMock.mocks.once).toHaveBeenCalledWith(
          'error',
          expect.any(Function)
        );
        expect(SpawnMock.mocks.kill).toHaveBeenCalledTimes(1);
        expect(SpawnMock.mocks.kill).toHaveBeenCalledWith('SIGINT');
      });
    });

    it('should fail to install the dependencies', () => {
      // Given
      const execPath = '/usr/bin/npm.js';
      const environmentUtils = {
        get: jest.fn(() => execPath),
      };
      const projectPath = '/some/project/path';
      const error = new Error('Unknown Error!');
      const spawn = jest.fn(() => {
        throw error;
      });
      SpawnMock.mock('spawn', spawn);
      let sut = null;
      // When
      sut = new Utils(environmentUtils);
      return sut.installDependencies(projectPath)
      .catch((result) => {
        // Then
        expect(result).toBe(error);
      });
    });
  });

  describe('jsStringify', () => {
    it('should transform an object into a string', () => {
      // Given
      const myObject = {
        propOne: 'valueOne',
        propTwp: ['some', 'list'],
        propThree: {
          hasSub: 'props',
        },
      };
      let sut = null;
      let result = null;
      // When
      sut = new Utils('environmentUtils');
      result = sut.jsStringify(myObject);
      // Then
      expect(result).toBe(
        [
          '{',
          '  propOne: \'valueOne\',',
          '  propTwp: [',
          '    \'some\',',
          '    \'list\',',
          '  ],',
          '  propThree: {',
          '    hasSub: \'props\',',
          '  },',
          '}',
        ].join('\n')
      );
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
      const expectedGets = ['environmentUtils'];
      // When
      utils(container);
      [[serviceName, serviceFn]] = container.set.mock.calls;
      sut = serviceFn();
      // Then
      expect(serviceName).toBe('utils');
      expect(serviceFn).toBeFunction();
      expect(sut).toBeInstanceOf(Utils);
      expect(container.set).toHaveBeenCalledTimes(1);
      expect(container.set).toHaveBeenCalledWith('utils', expect.any(Function));
      expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
      expectedGets.forEach((service) => {
        expect(container.get).toHaveBeenCalledWith(service);
      });
    });
  });
});
