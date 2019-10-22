const path = require('path');
const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/generator');

require('jasmine-expect');

const { Generator, generator } = require('/src/services/generator');
const fs = require('fs-extra');

describe('service:Generator', () => {
  beforeEach(() => {
    JimpleMock.reset();
    fs.ensureDir.mockClear();
    fs.writeFile.mockClear();
  });

  it('should generate a project files', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const utils = 'utils';
    const createConfigFile = false;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      scripts: {
        singleTarget: {
          build: 'projext build',
          start: 'projext start',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      path: 'my-project',
    };
    const targetInfo = {};
    const targetsInfo = [targetInfo];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: {},
            devDependencies: {
              [projectPackage.name]: `^${projectPackage.version}`,
              [engine.package.name]: `^${engine.package.version}`,
            },
            scripts: manifest.scripts.singleTarget,
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', 'index.js'),
        contents: [
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
    ];
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
    });
  });

  it('should generate a project files and embed the config on the target', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const utils = 'utils';
    const createConfigFile = false;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      scripts: {
        singleTarget: {
          build: 'projext build',
          start: 'projext start',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      path: 'my-project',
    };
    const targetInfo = {
      type: 'browser',
      library: true,
      types: 'typeScript',
    };
    const targetsInfo = [targetInfo];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: {},
            devDependencies: {
              [projectPackage.name]: `^${projectPackage.version}`,
              [engine.package.name]: `^${engine.package.version}`,
            },
            scripts: manifest.scripts.singleTarget,
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', 'index.ts'),
        contents: [
          '/**',
          ' * @projext',
          ' * type: browser',
          ' * library: true',
          ' * typeScript: true',
          ' */',
          '',
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
    ];
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
    });
  });

  it('should generate a project files for multiple targets', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - target 1 - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - target 2 - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const utils = 'utils';
    const createConfigFile = false;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      scripts: {
        multiTarget: {
          // eslint-disable-next-line no-template-curly-in-string
          'build:${name}': 'projext build ${name}',
          // eslint-disable-next-line no-template-curly-in-string
          'start:${name}': 'projext start ${name}',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      path: 'my-project',
    };
    const targetOneInfo = {
      name: 'targetOne',
      type: 'browser',
      library: true,
      types: 'typeScript',
    };
    const targetTwoInfo = {
      name: 'targetTwo',
    };
    const targetsInfo = [
      targetOneInfo,
      targetTwoInfo,
    ];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: {},
            devDependencies: {
              [projectPackage.name]: `^${projectPackage.version}`,
              [engine.package.name]: `^${engine.package.version}`,
            },
            scripts: {
              [`build:${targetOneInfo.name}`]: `projext build ${targetOneInfo.name}`,
              [`start:${targetOneInfo.name}`]: `projext start ${targetOneInfo.name}`,
              [`build:${targetTwoInfo.name}`]: `projext build ${targetTwoInfo.name}`,
              [`start:${targetTwoInfo.name}`]: `projext start ${targetTwoInfo.name}`,
            },
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', targetOneInfo.name, 'index.ts'),
        contents: [
          '/**',
          ' * @projext',
          ' * type: browser',
          ' * library: true',
          ' * typeScript: true',
          ' */',
          '',
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
      {
        path: path.join('src', targetTwoInfo.name, 'index.js'),
        contents: [
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
    ];
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
    });
  });

  it('should generate a project files with a target that uses a framework', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const utils = 'utils';
    const createConfigFile = false;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const frameworkPackage = {
      name: 'projext-plugin-webpack-react',
      version: 'Z',
    };
    const framework = {
      id: 'react',
      jsx: true,
      packages: {
        [engine.id]: frameworkPackage,
      },
      template: {
        csr: {
          dependencies: {},
          devDependencies: {
            react: 'u.u',
            'react-dom': 'o.o',
          },
        },
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      frameworks: [framework],
      scripts: {
        singleTarget: {
          build: 'projext build',
          start: 'projext start',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      framework: framework.id,
      path: 'my-project',
    };
    const targetInfo = {
      type: 'browser',
      framework: framework.id,
      library: true,
      types: 'typeScript',
    };
    const targetsInfo = [targetInfo];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: {},
            devDependencies: Object.assign(
              {},
              framework.template.csr.devDependencies,
              {
                [projectPackage.name]: `^${projectPackage.version}`,
                [engine.package.name]: `^${engine.package.version}`,
                [frameworkPackage.name]: `^${frameworkPackage.version}`,
              }
            ),
            scripts: manifest.scripts.singleTarget,
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', 'index.tsx'),
        contents: [
          '/**',
          ' * @projext',
          ' * type: browser',
          ' * library: true',
          ' * typeScript: true',
          ` * framework: ${framework.id}`,
          ' */',
          '',
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
    ];
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
    });
  });

  it('should generate a project files with a target that uses a framework for SSR', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const utils = 'utils';
    const createConfigFile = false;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const frameworkPackage = {
      name: 'projext-plugin-webpack-react',
      version: 'Z',
    };
    const framework = {
      id: 'react',
      ssr: true,
      packages: {
        [engine.id]: frameworkPackage,
      },
      template: {
        ssr: {
          dependencies: {
            'react-dom': 'o.o',
          },
          devDependencies: {
            react: 'u.u',
          },
        },
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      frameworks: [framework],
      scripts: {
        singleTarget: {
          build: 'projext build',
          start: 'projext start',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      framework: framework.id,
      path: 'my-project',
    };
    const targetInfo = {
      type: 'node',
      framework: framework.id,
      ssr: true,
      types: 'typeScript',
    };
    const targetsInfo = [targetInfo];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: framework.template.ssr.dependencies,
            devDependencies: Object.assign(
              {},
              framework.template.ssr.devDependencies,
              {
                [projectPackage.name]: `^${projectPackage.version}`,
                [engine.package.name]: `^${engine.package.version}`,
                [frameworkPackage.name]: `^${frameworkPackage.version}`,
              }
            ),
            scripts: manifest.scripts.singleTarget,
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', 'index.ts'),
        contents: [
          '/**',
          ' * @projext',
          ' * typeScript: true',
          ` * framework: ${framework.id}`,
          ' */',
          '',
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
    ];
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
    });
  });

  it('should generate a project files and write a configuration', () => {
    // Given
    // - package.json
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - target 1 - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - target 2 - index file
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    // - projext.config.js
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const stringified = '>config<';
    const utils = {
      jsStringify: jest.fn(() => stringified),
    };
    const createConfigFile = true;
    const engine = {
      id: 'webpack',
      package: {
        name: 'projext-plugin-webpack',
        version: 'Y',
      },
    };
    const projectPackage = {
      name: 'projext',
      version: 'X',
    };
    const manifest = {
      base: {
        packages: [projectPackage],
      },
      engines: [engine],
      scripts: {
        multiTarget: {
          // eslint-disable-next-line no-template-curly-in-string
          'build:${name}': 'projext build ${name}',
          // eslint-disable-next-line no-template-curly-in-string
          'start:${name}': 'projext start ${name}',
        },
      },
    };
    const projectInfo = {
      name: 'my-awesome-project',
      engine: engine.id,
      path: 'my-project',
    };
    const targetOneInfo = {
      name: 'targetOne',
      type: 'browser',
      library: true,
      types: 'typeScript',
    };
    const targetTwoInfo = {
      name: 'targetTwo',
    };
    const targetsInfo = [
      targetOneInfo,
      targetTwoInfo,
    ];
    let sut = null;
    const expectedFiles = [
      {
        path: 'package.json',
        contents: JSON.stringify(
          {
            name: projectInfo.name,
            dependencies: {},
            devDependencies: {
              [projectPackage.name]: `^${projectPackage.version}`,
              [engine.package.name]: `^${engine.package.version}`,
            },
            scripts: {
              [`build:${targetOneInfo.name}`]: `projext build ${targetOneInfo.name}`,
              [`start:${targetOneInfo.name}`]: `projext start ${targetOneInfo.name}`,
              [`build:${targetTwoInfo.name}`]: `projext build ${targetTwoInfo.name}`,
              [`start:${targetTwoInfo.name}`]: `projext start ${targetTwoInfo.name}`,
            },
          },
          null,
          2
        ),
      },
      {
        path: path.join('src', targetOneInfo.name, 'index.ts'),
        contents: [
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
      {
        path: path.join('src', targetTwoInfo.name, 'index.js'),
        contents: [
          '// Write your target code here...',
          '',
        ].join('\n'),
      },
      {
        path: 'projext.config.js',
        contents: `module.exports = ${stringified};\n`,
      },
    ];
    const expectedProjextConfig = {
      targets: {
        [targetOneInfo.name]: {
          name: targetOneInfo.name,
          type: 'browser',
          library: true,
          typeScript: true,
        },
        [targetTwoInfo.name]: {
          name: targetTwoInfo.name,
        },
      },
    };
    // When
    sut = new Generator(utils);
    return sut.generateFiles(
      createConfigFile,
      manifest,
      projectInfo,
      targetsInfo
    )
    .then(() => {
      expect(fs.ensureDir).toHaveBeenCalledTimes(expectedFiles.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(expectedFiles.length);
      expectedFiles.forEach((file) => {
        const filepath = path.join(projectInfo.path, file.path);
        expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(filepath));
        expect(fs.writeFile).toHaveBeenCalledWith(
          filepath,
          file.contents
        );
      });
      expect(utils.jsStringify).toHaveBeenCalledTimes(1);
      expect(utils.jsStringify).toHaveBeenCalledWith(expectedProjextConfig);
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
      const expectedGets = ['utils'];
      // When
      generator(container);
      [[serviceName, serviceFn]] = container.set.mock.calls;
      sut = serviceFn();
      // Then
      expect(serviceName).toBe('generator');
      expect(serviceFn).toBeFunction();
      expect(sut).toBeInstanceOf(Generator);
      expect(container.set).toHaveBeenCalledTimes(1);
      expect(container.set).toHaveBeenCalledWith('generator', expect.any(Function));
      expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
      expectedGets.forEach((service) => {
        expect(container.get).toHaveBeenCalledWith(service);
      });
    });
  });
});
