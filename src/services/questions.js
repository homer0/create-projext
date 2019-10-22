const { provider } = require('jimple');
const fs = require('fs-extra');
const inquirer = require('inquirer');

class Questions {
  constructor(
    logger,
    pathUtils
  ) {
    this._logger = logger;
    this._pathUtils = pathUtils;
    this._engines = [];
    this._frameworks = [];
    this._defaultEngine = '';
  }

  setEngines(engines) {
    this._engines = engines;
    this._defaultEngine = this._engines.find((engine) => engine.default).id;
  }

  setFrameworks(frameworks) {
    this._frameworks = frameworks;
  }

  askAboutTheProject(defaults = {}) {
    return (
      defaults.name ?
        this._validateProjectNameAsPromise(defaults.name) :
        Promise.resolve()
    )
    .then((name) => {
      const questions = [];
      if (!name) {
        questions.push({
          name: 'name',
          message: 'Project\'s name?',
          validate: this._validateProjectName.bind(this),
        });
      }

      if (!defaults.engine) {
        questions.push({
          name: 'engine',
          message: 'Build engine?',
          type: 'list',
          choices: this._engines.map((engine) => ({
            name: engine.name,
            value: engine.id,
          })),
          default: this._defaultEngine,
        });
      }

      if (typeof defaults.framework === 'undefined') {
        questions.push({
          name: 'framework',
          message: 'Install a framework?',
          when: (answers) => {
            let show = true;
            if (defaults.framework) {
              const useFramework = this._frameworks.find((framework) => (
                framework.id === defaults.framework
              ));
              if (useFramework) {
                const useEngine = answers.engine || defaults.engine;
                if (useFramework.engines.includes(useEngine)) {
                  show = false;
                }
              }
            }

            return show;
          },
          type: 'list',
          choices: (answers) => {
            const useEngine = answers.engine || defaults.engine;
            const frameworks = this._frameworks
            .filter((framework) => framework.engines.includes(useEngine))
            .map((framework) => ({
              name: framework.name,
              value: framework.id,
            }));

            return [
              {
                name: 'Nop',
                value: false,
              },
              ...frameworks,
            ];
          },
          default: false,
        });
      }

      if (!defaults.targetsCount) {
        const MAX_TARGETS_COUNT = 5;
        questions.push({
          name: 'targetsCount',
          message: 'How many targets?',
          type: 'list',
          choices: (new Array(MAX_TARGETS_COUNT)).fill('').map((_, index) => {
            const value = index + 1;
            return {
              name: value,
              value,
            };
          }),
          default: 0,
        });
      }

      let nextStep;
      if (questions.length) {
        this._logger.log(['+ Project information', '']);
        nextStep = inquirer.prompt(questions);
      } else {
        nextStep = {};
      }

      return nextStep;
    })
    .then((answers) => {
      const final = Object.assign({}, defaults, answers);
      final.path = this._pathUtils.join(final.name);
      return final;
    });
  }

  askAboutTheTargets(projectsInfo) {
    const firstStep = (
      projectsInfo.targetsCount > 1 ?
        this._askQuestionsForTargets(projectsInfo) :
        this._askQuestionsForSingleTarget(projectsInfo)
    );

    return firstStep
    .then((answers) => Object.keys(answers).reduce(
      (acc, key) => {
        const [, indexStr, property] = /(\d)-(\w+)/i.exec(key);
        const index = Number(indexStr);
        const newAcc = acc.slice();
        if (!newAcc[index]) {
          newAcc[index] = {};
        }

        newAcc[index][property] = answers[key];
        return newAcc;
      },
      []
    ));
  }

  _askQuestionsForTargets(projectsInfo) {
    const questions = (new Array(projectsInfo.targetsCount))
    .fill('')
    .map((_, index) => this._getQuestionsForTarget(index, projectsInfo))
    .reduce((acc, list) => [...acc, ...list], []);

    this._logger.log(['', '+ Targets information', '']);

    return inquirer.prompt(questions);
  }

  _askQuestionsForSingleTarget(projectsInfo) {
    const index = 0;
    const defaults = {};
    const questions = [];
    const supportsSSR = projectsInfo.framework &&
      this._frameworks.find((framework) => (
        framework.id === projectsInfo.framework &&
        framework.ssr
      ));
    if (supportsSSR) {
      questions.push(...[
        {
          name: `${index}-type`,
          message: 'Target type',
          type: 'list',
          choices: [
            {
              name: 'Browser',
              value: 'browser',
            },
            {
              name: 'NodeJS',
              value: 'node',
            },
          ],
          default: 'browser',
        },
        {
          name: `${index}-framework`,
          message: 'The target will do SSR with React',
          when: (answers) => answers[`${index}-type`] === 'node',
          type: 'confirm',
          default: false,
        },
      ]);
    } else if (projectsInfo.framework) {
      defaults[`${index}-type`] = 'browser';
    }

    questions.push(...[
      this._getModesQuestion(index),
      this._getTypesQuestion(index),
    ]);

    this._logger.log(['', '+ Target information', '']);

    return inquirer.prompt(questions)
    .then((answers) => Object.assign({}, defaults, answers));
  }

  _getQuestionsForTarget(index, projectsInfo) {
    const number = index + 1;
    return [
      {
        name: `${index}-name`,
        message: `Target name (${number})`,
        validate: this._validateName.bind(this),
      },
      {
        name: `${index}-type`,
        message: `Target type (${number})`,
        type: 'list',
        choices: [
          {
            name: 'Browser',
            value: 'browser',
          },
          {
            name: 'NodeJS',
            value: 'node',
          },
        ],
        default: 'browser',
      },
      {
        name: `${index}-framework`,
        message: `The target will do SSR with React (${number})`,
        when: (answers) => (
          answers[`${index}-type`] === 'node' &&
          projectsInfo.framework &&
          this._frameworks.find((framework) => (
            framework.id === projectsInfo.framework &&
            framework.ssr
          ))
        ),
        type: 'confirm',
        default: false,
      },
      this._getModesQuestion(index, number),
      this._getTypesQuestion(index, number),
    ];
  }

  _getModesQuestion(index, number = 0) {
    const numberLabel = number ?
      ` (${number})` :
      '';
    return {
      name: `${index}-library`,
      message: `Target mode${numberLabel}`,
      type: 'list',
      choices: [
        {
          name: 'App',
          value: false,
        },
        {
          name: 'Library',
          value: true,
        },
      ],
      default: false,
    };
  }

  _getTypesQuestion(index, number = 0) {
    const numberLabel = number ?
      ` (${number})` :
      '';
    return {
      name: `${index}-types`,
      message: `Target types validation${numberLabel}`,
      type: 'list',
      choices: [
        {
          name: 'Nop',
          value: false,
        },
        {
          name: 'TypeScript',
          value: 'typeScript',
        },
        {
          name: 'Flow',
          value: 'flow',
        },
      ],
      default: false,
    };
  }

  _validateName(name) {
    let result;
    if (name) {
      result = /[^a-z0-9-]/.test(name) ?
        `The name '${name}' is invalid: it can only contain lower case ` +
          'letters, numbers and dashes (-)' :
        true;
    } else {
      result = 'The name is required';
    }

    return result;
  }

  _validateProjectName(name) {
    let result;
    const nameValidation = this._validateName(name);
    if (nameValidation === true) {
      const projectPath = this._pathUtils.join(name);
      if (fs.pathExistsSync(projectPath)) {
        result = `There\'s already a directory named '${name}'`;
      } else {
        result = true;
      }
    } else {
      result = nameValidation;
    }

    return result;
  }

  _validateProjectNameAsPromise(name) {
    const validation = this._validateProjectName(name);
    return validation === true ?
      Promise.resolve(name) :
      Promise.reject(new Error(validation));
  }
}

const questions = provider((app) => {
  app.set('questions', () => new Questions(
    app.get('logger'),
    app.get('pathUtils')
  ));
});

module.exports = {
  Questions,
  questions,
};
