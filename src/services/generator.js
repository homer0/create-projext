const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
const ObjectUtils = require('wootils/shared/objectUtils');
/**
 * This is the class in charge of generating the files for the projects.
 */
class Generator {
  /**
   * @param {Utils} utils To stringify a projext configuration if needed.
   */
  constructor(utils) {
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     * @access protected
     * @ignore
     */
    this._utils = utils;
  }
  /**
   * This the method that generates all the files necessary for a projext project.
   * @param {Boolean}        createConfigFile Whether or not to write the targets
   *                                          settings on a projext configuration
   *                                          file or on the targets entry files.
   * @param {Manifest}       manifest         The manifest settings to get the
   *                                          packages that need to be installed.
   * @param {ProjectAnswers} projectInfo      The information about the project.
   * @param {Array}          targetsInfo      A list of the information of the
   *                                          targets ({@link TargetAnswer}).
   * @return {Promise<undefined, Error>}
   */
  generateFiles(
    createConfigFile,
    manifest,
    projectInfo,
    targetsInfo
  ) {
    const engine = manifest.engines.find((item) => item.id === projectInfo.engine);
    const framework = projectInfo.framework ?
      manifest.frameworks.find((item) => item.id === projectInfo.framework) :
      null;
    const packageJSON = this._getPackageJSON(
      projectInfo.name,
      engine,
      framework,
      manifest,
      targetsInfo
    );
    const jsonIndent = 2;
    const files = [{
      filepath: path.join(projectInfo.path, 'package.json'),
      contents: JSON.stringify(packageJSON, null, jsonIndent),
    }];
    const targetsConfig = this._getTargetsConfig(
      framework,
      projectInfo.name,
      targetsInfo
    );

    if (createConfigFile) {
      const projextConfig = this._generateProjextConfig(targetsConfig);
      const projextConfigJS = this._utils.jsStringify(projextConfig);
      files.push({
        filepath: path.join(projectInfo.path, 'projext.config.js'),
        contents: `module.exports = ${projextConfigJS};\n`,
      });
    }

    files.push(...this._generateTargetsFiles(
      path.join(projectInfo.path, 'src'),
      !createConfigFile,
      targetsConfig
    ));

    return files.reduce(
      (currentPromise, file) => currentPromise.then(() => this._writeFile(file)),
      Promise.resolve()
    );
  }
  /**
   * Writes a file on the filesystem. The reason of this wrapper is that it
   * first validates that the directory where the file needs to be written exists.
   * @param {Object} file          The file information.
   * @param {String} file.filepath The path for the file.
   * @param {String} file.contents The contents of the file.
   * @return {Promise<undefined,Error>}
   * @access protected
   * @ignore
   */
  _writeFile(file) {
    return fs.ensureDir(path.dirname(file.filepath))
    .then(() => fs.writeFile(file.filepath, file.contents));
  }
  /**
   * Generates the information for all the targets entry files.
   * @param {String}  sourcePath    Where the target file will be created.
   * @param {Boolean} writeConfig   If the settings of the target should be added as
   *                                comments on the entry file.
   * @param {Array}   targetsConfig A list of the information of the targets
   *                                ({@link TargetConfig}).
   * @return {Array} A list of objects with the properties `filepath` and `contents`.
   * @access protected
   * @ignore
   */
  _generateTargetsFiles(
    sourcePath,
    writeConfig,
    targetsConfig
  ) {
    const bodyLines = [
      '// Write your target code here...',
    ];

    return targetsConfig.map((target) => {
      const targetLines = writeConfig ?
        this._getTargetConfigLines(target) :
        [];

      targetLines.push(...bodyLines);
      targetLines.push('');

      return {
        filepath: path.join(sourcePath, target.filepath),
        contents: targetLines.join('\n'),
      };
    });
  }
  /**
   * Generates a list of lines for the settings comment a target will include on its
   * entry file in order for project to detect them as configuration.
   * @param {TargetConfig} target The target information.
   * @return {Array}
   * @access protected
   * @ignore
   */
  _getTargetConfigLines(target) {
    const properties = [
      'type',
      'library',
      'typeScript',
      'flow',
    ];
    const data = ObjectUtils.extract(target, properties);
    const lines = Object.keys(data).reduce(
      (newLines, key) => {
        const value = data[key];
        return [
          ...newLines,
          ` * ${key}: ${value}`,
        ];
      },
      []
    );

    if (target.framework) {
      lines.push(` * framework: ${target.framework}`);
    }

    let result;
    if (lines.length) {
      result = [
        '/**',
        ' * @projext',
        ...lines,
        ' */',
        '',
      ];
    } else {
      result = [];
    }

    return result;
  }
  /**
   * Generates a projext configuration based on a list of target settings.
   * @param {Array} targetsConfig A list of the information of the targets
   *                              ({@link TargetConfig}).
   * @return {Object}
   * @access protected
   * @ignore
   */
  _generateProjextConfig(targetsConfig) {
    const targets = targetsConfig.reduce(
      (newConfig, target) => {
        const { name: key } = target;
        const value = Object.assign({}, target);
        delete value.filepath;
        return Object.assign({}, newConfig, {
          [key]: value,
        });
      },
      {}
    );

    return { targets };
  }
  /**
   * Normalizes the information of a target into configuration settings.
   * @param {?Framework}  framework    The information of a selected framework for
   *                                   the project.
   * @param {String}       projectName The name of the project, to use as fallback
   *                                   for the target name.
   * @param {TargetAnswer} targetsInfo The target information.
   * @return {TargetConfig}
   * @access protected
   * @ignore
   */
  _getTargetsConfig(framework, projectName, targetsInfo) {
    const useFolder = targetsInfo.length > 1;
    return targetsInfo.map((target) => {
      const {
        name = projectName,
        type,
        library,
        types,
        framework: targetFramework,
      } = target;
      const targetConfig = {
        name,
      };

      if (type === 'browser') {
        targetConfig.type = 'browser';
      }

      if (library) {
        targetConfig.library = true;
      }

      if (types) {
        targetConfig[types] = true;
      }

      let usesJSX = false;
      if (framework && targetFramework) {
        targetConfig.framework = framework.id;
        usesJSX = !!framework.jsx;
      }

      let extension = targetConfig.typeScript ? 'ts' : 'js';
      if (usesJSX) {
        extension = `${extension}x`;
      }

      const filename = `index.${extension}`;
      const filepath = useFolder ?
        path.join(name, filename) :
        filename;

      targetConfig.filepath = filepath;
      return targetConfig;
    });
  }
  /**
   * Generates a `package.json` for the project.
   * @param {String}     projectName  The name of the project.
   * @param {Engine}     engine       The selected engine for the project.
   * @param {?Framework} framework    The information of a selected framework
   *                                  for the project.
   * @param {Manifest}   manifest     The manifest settings to get the
   *                                  packages that need to be installed.
   * @param {Array}      targetsInfo  A list of the information of the targets
   *                                  ({@link TargetAnswer}).
   * @return {Object} The contents of the project `package.json`
   * @access protected
   * @ignore
   */
  _getPackageJSON(
    projectName,
    engine,
    framework,
    manifest,
    targetsInfo
  ) {
    let dependencies;
    let devDependencies;
    let scripts;
    const devPackages = manifest.base.packages.slice();
    devPackages.push(engine.package);
    if (framework) {
      devPackages.push(framework.packages[engine.id]);
      const atLeastOneSSR = targetsInfo.some((target) => (
        target.type === 'node' &&
        target.framework
      ));
      const renderKey = atLeastOneSSR ? 'ssr' : 'csr';
      ({ dependencies, devDependencies } = framework.template[renderKey]);
    } else {
      dependencies = {};
      devDependencies = {};
    }

    devDependencies = devPackages.reduce(
      (currentDevDeps, devPackage) => Object.assign({}, currentDevDeps, {
        [devPackage.name]: `^${devPackage.version}`,
      }),
      devDependencies
    );

    if (targetsInfo.length > 1) {
      const multiTargetScripts = Object.keys(manifest.scripts.multiTarget);
      scripts = targetsInfo.reduce(
        (newScripts, target) => {
          const targetScripts = multiTargetScripts.reduce(
            (newTargetScripts, scriptName) => {
              const newScriptName = scriptName.replace(/\$\{name\}/g, target.name);
              const newScriptValue = manifest.scripts.multiTarget[scriptName].replace(
                /\$\{name\}/g,
                target.name
              );

              return Object.assign({}, newTargetScripts, {
                [newScriptName]: newScriptValue,
              });
            },
            {}
          );

          return Object.assign({}, newScripts, targetScripts);
        },
        {}
      );
    } else {
      scripts = Object.assign({}, manifest.scripts.singleTarget);
    }

    return {
      name: projectName,
      dependencies,
      devDependencies,
      scripts,
    };
  }
}
/**
 * The service provider that once registered on the dependency injection container
 * will register an instance of {@link Generator} as the `generator` service.
 * @type {Provider}
 */
const generator = provider((app) => {
  app.set('generator', () => new Generator(
    app.get('utils')
  ));
});

module.exports = {
  Generator,
  generator,
};
