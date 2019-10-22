const { spawn } = require('child_process');
const { provider } = require('jimple');

class Utils {
  constructor(environmentUtils) {
    this._environmentUtils = environmentUtils;
  }

  usesYarn() {
    return this._environmentUtils.get('npm_execpath').includes('bin/yarn');
  }

  installDependencies(projectPath) {
    let child;
    return new Promise((resolve, reject) => {
      const options = {
        shell: true,
        stdio: 'ignore',
        cwd: projectPath,
      };
      child = this.usesYarn ?
        spawn('yarn', [], options) :
        spawn('npm', ['install'], options);

      child.once('exit', () => resolve());
      child.once('error', reject);
    })
    .then(() => {
      child.kill('SIGINT');
    });
  }

  jsStringify(obj) {
    const jsonIndentation = 2;
    const json = JSON.stringify(obj, undefined, jsonIndentation)
    // Escape single quotes.
    .replace(/'/g, '\\\'')
    // Replace double quotes with single quotes.
    .replace(/"/g, '\'')
    // Remove single quotes from keys.
    .replace(/^(\s+)?(')(\w+)('): /mg, '$1$3: ')
    /**
     * Add trailing commas. The reason the regex is executed twice is because matches can't
     * intersect other matches, and since the regex uses a closing symbol as delimiter, that same
     * delimiter can't be fixed unless we run the regex again.
     */
    .replace(/([\]|}|\w|'])(\n(?:\s+)?[}|\]])/g, '$1,$2')
    .replace(/([\]|}])(\n(?:\s+)?[}|\]])/g, '$1,$2');

    return `module.exports = ${json};\n`;
  }
}

const utils = provider((app) => {
  app.set('utils', () => new Utils(app.get('environmentUtils')));
});

module.exports = {
  Utils,
  utils,
};
