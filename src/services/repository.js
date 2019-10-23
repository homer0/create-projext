const fetch = require('node-fetch');
const { provider } = require('jimple');
/**
 * This class is in charge of handling the information related to the application's repository.
 * It also loads and downloads the settings manifest.
 */
class Repository {
  /**
   * @param {Info}     info          The contents of the application's package.json, to get the
   *                                 repository URL.
   * @param {Manifest} localManifest The local manifest in case the application intends to run
   *                                 without downloading the one from the repository.
   */
  constructor(info, localManifest) {
    /**
     * The URL for the application's repository.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._url = `https://github.com/${info.repository}`;
    /**
     * The URL for the settings manifest on the online repository.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._manifestURL = `https://raw.githubusercontent.com/${info.repository}/master/manifest.json`;
    /**
     * The contents of the local manifest.
     * @type {Manifest}
     * @access protected
     * @ignore
     */
    this._localManifest = localManifest;
  }
  /**
   * Gets the settins manifest. Based on the `local` parameter, the method will either download it
   * from the online repository or return the one saved inside the application.
   * @param {Boolean} [local=false] Whether or not to use the manifest inside the application.
   * @return {Promise<Manifest,Error>}
   */
  getManifest(local = false) {
    let result;
    if (local) {
      result = Promise.resolve(this._localManifest);
    } else {
      result = fetch(this._manifestURL)
      .then((response) => response.json());
    }

    return result;
  }
  /**
   * The URL for the application's repository.
   * @type {String}
   */
  get url() {
    return this._url;
  }
}
/**
 * The service provider that once registered on the dependency injection container
 * will register an instance of {@link Repository} as the `repository` service.
 * @type {Provider}
 */
const repository = provider((app) => {
  app.set('repository', () => new Repository(
    app.get('info'),
    app.get('localManifest')
  ));
});

module.exports = {
  Repository,
  repository,
};
