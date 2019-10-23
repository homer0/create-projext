const { provider } = require('jimple');
const fs = require('fs-extra');
const { prompt } = require('inquirer');
/**
 * This is the class in charge of asking the user all the necessary questions to
 * generate a projext project.
 */
class Questions {
  /**
   * @param {Logger}    logger    To log messages on the console.
   * @param {PathUtils} pathUtils To generate the project path.
   */
  constructor(
    logger,
    pathUtils
  ) {
    /**
     * A local reference for the `logger` service.
     * @type {Logger}
     * @access protected
     * @ignore
     */
    this._logger = logger;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     * @access protected
     * @ignore
     */
    this._pathUtils = pathUtils;
    /**
     * The list of {@link Engine}s the class can use for the questions' options.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._engines = [];
    /**
     * The list of {@link Framework}s the class can use for the questions' options.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._frameworks = [];
    /**
     * The ID of the default engine that can be selected.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._defaultEngine = '';
  }
  /**
   * Sets the list of {@link Engine}s the class can use for the questions' options.
   * @param {Array} engines The list of {@link Engine}s.
   */
  setEngines(engines) {
    this._engines = engines;
    this._defaultEngine = this._engines.find((engine) => engine.default).id;
  }
  /**
   * Sets the list of {@link Framework}s the class can use for the questions' options.
   * @param {Array} frameworks The list of {@link Framework}s.
   */
  setFrameworks(frameworks) {
    this._frameworks = frameworks;
  }
  /**
   * Asks the users the questions related to the project.
   * @param {ProjectAnswers} [defaults={}] Default values to avoid asking all the questions.
   * @return {Promise<ProjectAnswers,Error>}
   */
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

      this._logger.log(['+ Project information', '']);
      return prompt(questions);
    })
    .then((answers) => {
      const final = Object.assign({}, defaults, answers);
      final.path = this._pathUtils.join(final.name);
      return final;
    });
  }
  /**
   * Asks the user all the questions related to the targets.
   * @param {ProjectAnswers} projectInfo The project information.
   * @return {Promise<Array,Error>}
   */
  askAboutTheTargets(projectInfo) {
    const ssrSupport = projectInfo.framework &&
      this._frameworks.some((framework) => (
        framework.id === projectInfo.framework &&
        framework.ssr
      ));
    const firstStep = (
      projectInfo.targetsCount > 1 ?
        this._askQuestionsForTargets(projectInfo, ssrSupport) :
        this._askQuestionsForSingleTarget(projectInfo, ssrSupport)
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
  /**
   * Asks the questions for the targets when there's more than one target.
   * @param {ProjectAnswers} projectInfo The project information.
   * @param {Boolean}        ssrSupport  Whether or not the project uses a framework that supports
   *                                     SSR.
   * @return {Promise<Object,Error>}
   * @access protected
   * @ignore
   */
  _askQuestionsForTargets(projectInfo, ssrSupport) {
    const questions = (new Array(projectInfo.targetsCount))
    .fill('')
    .map((_, index) => this._getQuestionsForTarget(
      index,
      projectInfo,
      ssrSupport
    ))
    .reduce((acc, list) => [...acc, ...list], []);

    this._logger.log(['', '+ Targets information', '']);

    return prompt(questions);
  }
  /**
   * Asks the question for a single target, when there's only one target for the project.
   * The difference with {@link Questions#_getQuestionsForTarget} is that this method doesn't
   * ask for name and framework.
   * @param {ProjectAnswers} projectInfo The project information.
   * @param {Boolean}        ssrSupport  Whether or not the project uses a framework that supports
   *                                     SSR.
   * @return {Promise<Object,Error>}
   * @access protected
   * @ignore
   */
  _askQuestionsForSingleTarget(projectInfo, ssrSupport) {
    const index = 0;
    const defaults = {};
    const questions = [];
    if (ssrSupport) {
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
          message: 'The target will do SSR?',
          when: (answers) => answers[`${index}-type`] === 'node',
          type: 'confirm',
          default: false,
        },
      ]);
    } else if (projectInfo.framework) {
      defaults[`${index}-type`] = 'browser';
    }

    questions.push(...[
      this._getModesQuestion(index),
      this._getTypesQuestion(index),
    ]);

    this._logger.log(['', '+ Target information', '']);

    return prompt(questions)
    .then((answers) => Object.assign({}, defaults, answers));
  }
  /**
   * Asks the question for a single target, when there's more than one target on the project.
   * The difference with {@link Questions#_askQuestionsForSingleTarget} is that this method doesn't
   * ask questions, it just generates them for {@link Questions#_askQuestionsForTargets}.
   * @param {Number}         index       The index of the target on the list.
   * @param {ProjectAnswers} projectInfo The project information.
   * @param {Boolean}        ssrSupport  Whether or not the project uses a framework that supports
   *                                     SSR.
   * @return {Promise<Object,Error>}
   * @access protected
   * @ignore
   */
  _getQuestionsForTarget(index, projectInfo, ssrSupport) {
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
        message: `The target will use the framework: ${projectInfo.framework} (${number})`,
        when: (answers) => !!(
          projectInfo.framework && (
            answers[`${index}-type`] === 'browser' ||
            ssrSupport
          )
        ),
        type: 'confirm',
        default: false,
      },
      this._getModesQuestion(index, number),
      this._getTypesQuestion(index, number),
    ];
  }
  /**
   * Gets the question for the target mode (app or library).
   * @param {Number} index      The index of the target on the list.
   * @param {Number} [number=0] In case this is for a list, this number will be added to the
   *                            `message` property.
   * @return {Question}
   * @access protected
   * @ignore
   */
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
  /**
   * Gets the question for the target types validation (TypeScript, Flow or none).
   * @param {Number} index      The index of the target on the list.
   * @param {Number} [number=0] In case this is for a list, this number will be added to the
   *                            `message` property.
   * @return {Question}
   * @access protected
   * @ignore
   */
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
  /**
   * Validates a name to be used for the project name or a target name.
   * @param {String} name The name to validate.
   * @return {Boolean|String} This follows {@link Inquirer} validation pattern: If there's an
   *                          error, it returns the error message, otherwise it returns `true`.
   * @access protected
   * @ignore
   */
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
  /**
   * Validates a name to be used as project name. It calls {@link Questions#_validateName} and
   * then it checks that there's not a directory with the same name on the current path.
   * @param {String} name The name to validate.
   * @return {Boolean|String} This follows {@link Inquirer} validation pattern: If there's an
   *                          error, it returns the error message, otherwise it returns `true`.
   * @access protected
   * @ignore
   */
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
  /**
   * This is a wrapper of {@link Questions#_validateProjectName} to be used as a Promise, outside
   * {@link Inquirer}.
   * @param {String} name The name to validate.
   * @return {Promise<String,Error>}
   * @access protected
   * @ignore
   */
  _validateProjectNameAsPromise(name) {
    const validation = this._validateProjectName(name);
    return validation === true ?
      Promise.resolve(name) :
      Promise.reject(new Error(validation));
  }
}
/**
 * The service provider that once registered on the dependency injection container
 * will register an instance of {@link Questions} as the `questions` service.
 * @type {Provider}
 */
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
