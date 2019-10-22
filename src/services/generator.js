const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
const ObjectUtils = require('wootils/shared/objectUtils');

class Generator {
  constructor(utils) {
    this._utils = utils;
  }

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
      engine,
      framework,
      manifest,
      projectInfo,
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
      files.push({
        filepath: path.join(projectInfo.path, 'projext.config.js'),
        contents: this._utils.jsStringify(projextConfig),
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

  _writeFile(file) {
    return fs.ensureDir(path.dirname(file.filepath))
    .then(() => fs.writeFile(file.filepath, file.contents));
  }

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
        let nextLines;
        if (typeof value === 'undefined') {
          nextLines = newLines;
        } else {
          nextLines = [
            ...newLines,
            ` * ${key}: ${value}`,
          ];
        }

        return nextLines;
      },
      []
    );

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

  _getPackageJSON(
    engine,
    framework,
    manifest,
    projectInfo,
    targetsInfo
  ) {
    let dependencies;
    let devDependencies;
    let scripts;
    const devPackages = manifest.base.packages.slice();
    devPackages.push(engine.package);
    if (projectInfo.framework) {
      devPackages.push(framework.packages[projectInfo.engine]);
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
      name: projectInfo.name,
      dependencies,
      devDependencies,
      scripts,
    };
  }
}

const generator = provider((app) => {
  app.set('generator', () => new Generator(
    app.get('utils')
  ));
});

module.exports = {
  Generator,
  generator,
};
