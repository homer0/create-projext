const fetch = require('node-fetch');
const { provider } = require('jimple');

class Repository {
  constructor(info, localManifest) {
    this._url = `https://github.com/${info.repository}`;
    this._manifestURL = `https://raw.githubusercontent.com/${info.repository}/master/manifest.json`;
    this._localManifest = localManifest;
  }

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

  get url() {
    return this._url;
  }
}

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
