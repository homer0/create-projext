const { provider } = require('jimple');

const FRAMEWORKS = ({ webpack, rollup }) => ({
  angularjs: {
    id: 'angularjs',
    name: 'AngularJS',
    ssr: false,
    engines: [webpack.id, rollup.id],
    packages: {
      [webpack.id]: 'projext-plugin-webpack-angularjs',
      [rollup.id]: 'projext-plugin-rollup-angularjs',
    },
  },
  aurelia: {
    id: 'aurelia',
    name: 'Aurelia',
    ssr: false,
    engines: [webpack.id],
    packages: {
      [webpack.id]: 'projext-plugin-webpack-aurelia',
    },
  },
  react: {
    id: 'react',
    name: 'React',
    ssr: true,
    engines: [webpack.id, rollup.id],
    packages: {
      [webpack.id]: 'projext-plugin-webpack-angularjs',
      [rollup.id]: 'projext-plugin-rollup-angularjs',
    },
  },
});

const frameworks = provider((app) => {
  app.set('FRAMEWORKS', () => FRAMEWORKS(app.get('ENGINES')));
});

module.exports = {
  FRAMEWORKS,
  frameworks,
};
