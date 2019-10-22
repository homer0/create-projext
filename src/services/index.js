const { provider } = require('jimple');
const { cli } = require('./cli');
const { generator } = require('./generator');
const { questions } = require('./questions');
const { repository } = require('./repository');
const { utils } = require('./utils');

module.exports = provider((app) => {
  app.register(cli);
  app.register(generator);
  app.register(questions);
  app.register(repository);
  app.register(utils);
});
