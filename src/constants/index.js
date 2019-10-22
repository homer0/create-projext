const { provider } = require('jimple');
const { engines } = require('./engines');
const { frameworks } = require('./frameworks');

module.exports = provider((app) => {
  app.register(engines);
  app.register(frameworks);
});
