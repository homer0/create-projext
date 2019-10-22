const { provider } = require('jimple');

const ENGINES = () => ({
  webpack: {
    id: 'webpack',
    name: 'webpack',
    package: 'projext-plugin-webpack',
    default: true,
  },
  rollup: {
    id: 'rollup',
    name: 'Rollup',
    package: 'projext-plugin-rollup',
  },
});

const engines = provider((app) => {
  app.set('ENGINES', () => ENGINES());
});

module.exports = {
  ENGINES,
  engines,
};
