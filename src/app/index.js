const Jimple = require('jimple');

const {
  environmentUtils,
  errorHandler,
  logger,
  packageInfo,
  pathUtils,
} = require('wootils/node/providers');

const appPackage = require('../../package.json');
const localManifest = require('../../manifest.json');
const services = require('../services');

/**
 * The main class and dependency injection container for the application.
 * @extends {Jimple}
 */
class CreateProjext extends Jimple {
  /**
   * Registers all the known services and adds an error handler.
   * @ignore
   */
  constructor() {
    super();

    this.set('info', () => appPackage);
    this.set('localManifest', () => localManifest);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(logger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(services);

    this._addErrorHandler();
  }
  /**
   * Starts the CLI interface.
   */
  start() {
    this.get('cli').start();
  }
  /**
   * Makes the `errorHandler` service listen for any uncaught exceptions the
   * application may throw.
   * @access protected
   * @ignore
   */
  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = CreateProjext;
