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

const constants = require('../constants');
const services = require('../services');

class CreateProjext extends Jimple {
  constructor() {
    super();

    this.set('info', () => appPackage);
    this.set('localManifest', () => localManifest);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(logger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(constants);
    this.register(services);

    this._addErrorHandler();
  }

  start() {
    this.get('cli').runHandler();
  }

  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = CreateProjext;
