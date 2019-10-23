/**
 * @external {Jimple}
 * https://yarnpkg.com/en/package/jimple
 */

/**
 * @external {Logger}
 * https://homer0.github.io/wootils/class/wootils/node/logger.js~Logger.html
 */

/**
 * @external {minimist}
 * https://yarnpkg.com/en/package/minimist
 * @ignore
 */

/**
 * @external {Inquirer}
 * https://yarnpkg.com/en/package/inquirer
 * @ignore
 */

/**
 * @external {Question}
 * https://www.npmjs.com/package/inquirer#questions
 * @ignore
 */

/**
 * @external {PathUtils}
 * https://homer0.github.io/wootils/class/wootils/node/pathUtils.js~PathUtils.html
 */

/**
 * @external {EnvironmentUtils}
 * https://homer0.github.io/wootils/class/wootils/node/environmentUtils.js~EnvironmentUtils.html
 */

/**
 * @typedef {Object} CLIHandler
 * @property {Array}   triggers A list of words/letters that can trigger the
 *                              execution of the handler. For example:
 *                              `['h', 'help']`. If the trigger is only one letter,
 *                              the handler will be triggered with `-${letter}`,
 *                              otherwise, it will be `--${trigger}`.
 * @property {Function} handler The actual handler function that gets called when
 *                              triggered.
 * @ignore
 */

/**
 * @typedef {Object} CLIOption
 * @property {Array} triggers     A list f words/letters that the CLI will detect in
 *                                order to enable the option. For example:
 *                                `['q', 'quick']`. If the trigger is only one
 *                                letter, the option will be triggered with
 *                                `-${letter}`, otherwise, it will be `--${trigger}`.
 * @property {String} description A simple description about what the option does.
 * @ignore
 */

/**
 * @typedef {Object} CLIOptions
 * @property {Boolean} rollup     Whether or not the user wants to use Rollup as
 *                                build engine.
 * @property {Boolean} quick      Whether or not to try to create a target without
 *                                asking a lot of questions.
 * @property {Boolean} node       Whether or not the target of 'quick mode' should
 *                                be a NodeJS target.
 * @property {Boolean} angularjs  Whether or not the user wants to use AngularJS
 *                                for the project.
 * @property {Boolean} aurelia    Whether or not the user wants to use Aurelia for
 *                                the project.
 * @property {Boolean} react      Whether or not the user wants to use React for
 *                                the project.
 * @property {Boolean} flow       Whether or not the target of 'quick mode' should
 *                                use Flow.
 * @property {Boolean} typeScript Whether or not the target of 'quick mode' should
 *                                use TypeScript.
 * @property {Boolean} library    Whether or not the target of 'quick mode' should
 *                                be a library.
 * @property {Boolean} config     Whether or not the user wants to create a
 *                                configuration file for the targets.
 * @property {Boolean} local      Whether or not the application should use the
 *                                local manifest for the settings.
 * @ignore
 */

/**
 * @typedef {Object} ProjectAnswers
 * @property {String}         engine       The `id` of the selected build engine.
 * @property {String|Boolean} framework    The `id` of a selected framework or
 *                                         `false`.
 * @property {Number}         targetsCount How many targets will be generated.
 */

/**
 * @typedef {Object} TargetAnswer
 * @property {?String}        name      The name of the target. Default is the same as the project.
 * @property {?String}        type      The type of the target. Default is browser.
 * @property {?String}        framework The `id` of a selected framework.
 * @property {String|Boolean} types     `typeScript`, `flow` or `false`.
 */

/**
 * @typedef {Object} TargetConfig
 * @property {String}   name       The name of the target.
 * @property {String}   filepath   The path for its entry file.
 * @property {?String}  type       The type of target. Projext's default is `node`.
 * @property {?Boolean} library    Whether or not the target is a library.
 * @property {?Boolean} typeScript Whether or not the target uses TypeScript.
 * @property {?Boolean} flow       Whether or not the target uses Flow.
 * @property {?String}  framework  Whether or not the target uses an installed
 *                                 framework.
 */

/**
 * @typedef {Object} Info
 * @property {String} name       The name of the application.
 * @property {String} homepage   The URL of the application website.
 * @property {String} repository The Github path to the repository.
 * @property {String} version    The version of the application.
 * @property {Object} bin        A dictionary of executables.
 */

/**
 * @typedef {function} ProviderRegisterMethod
 * @param {CreateProject} app
 * A reference to the main dependency injection container.
 */

/**
 * @typedef {Object} Provider
 * @property {ProviderRegisterMethod} register
 * The method that gets called by projext when registering the provider.
 */

/**
 * @typedef {Object} DevPackage
 * @property {String} name    The name of the package.
 * @property {String} version The version of the package.
 */

/**
 * @typedef {Object} Engine
 * @property {String}     id      A unique ID for the engine.
 * @property {String}     name    The name of the engine.
 * @property {DevPackage} package The information about the engine package.
 * @property {?Boolean}   default Whether or not the engine should be the
 *                                default one.
 */

/**
 * @typedef {Object} FrameworkTemplate
 * @property {Object} dependencies    A dictionary of production dependencies.
 * @property {Object} devDependencies A dictionary of development dependencies.
 */

/**
 * @typedef {Object} FrameworkTemplates
 * @property {FrameworkTemplate} csr A dependencies template for when the project
 *                                   will only use the framework for Client Side
 *                                   Rendering (CSR).
 * @property {FrameworkTemplate} ssr A dependencies template for when the project
 *                                   will use the framework for both Client Side
 *                                   Rendering (CSR) and Server Side Rendering (SSR).
 */

/**
 * @typedef {Object} Framework
 * @property {String}             id        A unique ID for the framework.
 * @property {String}             name      The name of the framework.
 * @property {Boolean}            ssr       Whether or not the framework supports
 *                                          SSR.
 * @property {Array}              engines   A list of the engines that can use the
 *                                          framework.
 * @property {Object}             packages  A dictionary with the {@link DevPackage}
 *                                          for the different engines.
 * @property {FrameworkTemplates} templates The framework templates for CSR and SSR.
 */

/**
 * @typedef {Object} ManifestBase
 * @property {Array} packages A list of {@link DevPackage} that should be installed
 *                            as `devDependencies` on all the projects.
 */

/**
 * @typedef {Object} ManifestScripts
 * @property {Object} multiTarget  A dictionary of reusable scripts that will be
 *                                 used for when a project has more than one target.
 *                                 Both the keys and the values can use `${name}`
 *                                 as placeholder and it will be replaced for the
 *                                 name of the target when the `package.json` gets
 *                                 generated.
 * @property {Object} singleTarget A dictionary of scripts for when the project has
 *                                 a single target.
 */

/**
 * @typedef {Object} Manifest
 * @property {ManifestBase}    base       The base settings for all the projects.
 * @property {ManifestScripts} scripts    The settings for the scripts of the
 *                                        `pacakge.json` that will be generated.
 * @property {Array}           engines    A list of {@link Engines}.
 * @property {Array}           frameworks A list of {@link Frameworks}.
 */
