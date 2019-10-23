const { spawn } = require('child_process');
const { provider } = require('jimple');
/**
 * A class with generic utilities.
 */
class Utils {
  /**
   * @param {EnvironmentUtils} environmentUtils To detect if the user uses Yarn or
   *                                            not.
   */
  constructor(environmentUtils) {
    /**
     * A local reference for the `environmentUtils` service.
     * @type {EnvironmentUtils}
     * @access protected
     * @ignore
     */
    this._environmentUtils = environmentUtils;
  }
  /**
   * Checks whether or not the user is using Yarn.
   * @return {Boolean}
   */
  usesYarn() {
    return this._environmentUtils.get('npm_execpath').includes('bin/yarn');
  }
  /**
   * Runs `yarn` or `npm install` on a given directory. The command will be decided
   * by calling {@link Utils#usesYarn}.
   * @param {String}  projectPath The path to the directory where the command should
   *                              be ran.
   * @return {Promise<undefined,Error>}
   */
  installDependencies(projectPath) {
    let child;
    return new Promise((resolve, reject) => {
      const options = {
        shell: true,
        stdio: 'ignore',
        cwd: projectPath,
      };
      child = this.usesYarn() ?
        spawn('yarn', [], options) :
        spawn('npm', ['install'], options);

      child.once('exit', () => resolve());
      child.once('error', reject);
    })
    .then(() => {
      child.kill('SIGINT');
    });
  }
  /**
   * This is similar to `JSON.stringify` but it removes unnecessary quotes from keys and
   * replaces double quotes with single quotes. The idea is to generate a string that can be
   * written on a `.js` file.
   * @param {Object} obj The object to stringify.
   * @return {String}
   */
  jsStringify(obj) {
    const jsonIndentation = 2;
    return JSON.stringify(obj, undefined, jsonIndentation)
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
  }
}
/**
 * The service provider that once registered on the dependency injection container
 * will register an instance of {@link Utils} as the `utils` service.
 * @type {Provider}
 */
const utils = provider((app) => {
  app.set('utils', () => new Utils(app.get('environmentUtils')));
});

module.exports = {
  Utils,
  utils,
};
