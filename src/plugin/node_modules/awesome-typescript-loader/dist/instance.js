"use strict";
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var helpers_1 = require("./helpers");
var checker_1 = require("./checker");
var watch_mode_1 = require("./watch-mode");
var colors = require('colors/safe');
var pkg = require('../package.json');
function getRootCompiler(compiler) {
    if (compiler.parentCompilation) {
        return getRootCompiler(compiler.parentCompilation.compiler);
    }
    else {
        return compiler;
    }
}
function getInstanceStore(compiler) {
    var store = getRootCompiler(compiler)._tsInstances;
    if (store) {
        return store;
    }
    else {
        throw new Error('Can not resolve instance store');
    }
}
function ensureInstanceStore(compiler) {
    var rootCompiler = getRootCompiler(compiler);
    if (!rootCompiler._tsInstances) {
        rootCompiler._tsInstances = {};
    }
}
function resolveInstance(compiler, instanceName) {
    return getInstanceStore(compiler)[instanceName];
}
var COMPILER_ERROR = colors.red("\n\nTypescript compiler cannot be found, please add it to your package.json file:\n    npm install --save-dev typescript\n");
var BABEL_ERROR = colors.red("\n\nBabel compiler cannot be found, please add it to your package.json file:\n    npm install --save-dev babel-core\n");
var id = 0;
function ensureInstance(webpack, query, instanceName) {
    ensureInstanceStore(webpack._compiler);
    var rootCompiler = getRootCompiler(webpack._compiler);
    var watching = isWatching(rootCompiler);
    var exInstance = resolveInstance(webpack._compiler, instanceName);
    if (exInstance) {
        return exInstance;
    }
    var compilerInfo = setupTs(query.compiler);
    var tsImpl = compilerInfo.tsImpl;
    var _a = readConfigFile(process.cwd(), query, tsImpl), configFilePath = _a.configFilePath, compilerConfig = _a.compilerConfig, loaderConfig = _a.loaderConfig;
    applyDefaults(configFilePath, compilerConfig, loaderConfig);
    if (!loaderConfig.silent) {
        var sync = watching === WatchMode.Enabled ? ' (in a forked process)' : '';
        console.log("\n[" + instanceName + "] Using typescript@" + compilerInfo.compilerVersion + " from " + compilerInfo.compilerPath + " and "
            + ("\"tsconfig.json\" from " + configFilePath + sync + ".\n"));
    }
    var babelImpl = setupBabel(loaderConfig);
    var cacheIdentifier = setupCache(loaderConfig, tsImpl, webpack, babelImpl);
    var compiler = webpack._compiler;
    setupWatchRun(compiler, instanceName);
    setupAfterCompile(compiler, instanceName);
    var webpackOptions = _.pick(webpack._compiler.options, 'resolve');
    var checker = new checker_1.Checker(compilerInfo, loaderConfig, compilerConfig, webpackOptions, watching === WatchMode.Enabled);
    return getInstanceStore(webpack._compiler)[instanceName] = {
        id: ++id,
        babelImpl: babelImpl,
        compiledFiles: {},
        loaderConfig: loaderConfig,
        configFilePath: configFilePath,
        compilerConfig: compilerConfig,
        checker: checker,
        cacheIdentifier: cacheIdentifier
    };
}
exports.ensureInstance = ensureInstance;
function findTsImplPackage(inputPath) {
    var pkgDir = path.dirname(inputPath);
    if (fs.readdirSync(pkgDir).find(function (value) { return value === 'package.json'; })) {
        return path.join(pkgDir, 'package.json');
    }
    else {
        return findTsImplPackage(pkgDir);
    }
}
function setupTs(compiler) {
    var compilerPath = compiler || 'typescript';
    var tsImpl;
    var tsImplPath;
    try {
        tsImplPath = require.resolve(compilerPath);
        tsImpl = require(tsImplPath);
    }
    catch (e) {
        console.error(e);
        console.error(COMPILER_ERROR);
        process.exit(1);
    }
    var pkgPath = findTsImplPackage(tsImplPath);
    var compilerVersion = require(pkgPath).version;
    var compilerInfo = {
        compilerPath: compilerPath,
        compilerVersion: compilerVersion,
        tsImpl: tsImpl,
    };
    return compilerInfo;
}
exports.setupTs = setupTs;
function setupCache(loaderConfig, tsImpl, webpack, babelImpl) {
    var cacheIdentifier = null;
    if (loaderConfig.useCache) {
        if (!loaderConfig.cacheDirectory) {
            loaderConfig.cacheDirectory = path.join(process.cwd(), '.awcache');
        }
        if (!fs.existsSync(loaderConfig.cacheDirectory)) {
            fs.mkdirSync(loaderConfig.cacheDirectory);
        }
        cacheIdentifier = {
            'typescript': tsImpl.version,
            'awesome-typescript-loader': pkg.version,
            'awesome-typescript-loader-query': webpack.query,
            'babel-core': babelImpl
                ? babelImpl.version
                : null
        };
    }
}
function setupBabel(loaderConfig) {
    var babelImpl;
    if (loaderConfig.useBabel) {
        try {
            var babelPath = loaderConfig.babelCore || path.join(process.cwd(), 'node_modules', 'babel-core');
            babelImpl = require(babelPath);
        }
        catch (e) {
            console.error(BABEL_ERROR);
            process.exit(1);
        }
    }
    return babelImpl;
}
function applyDefaults(configFilePath, compilerConfig, loaderConfig) {
    _.defaults(compilerConfig.options, {
        sourceMap: true,
        verbose: false,
        skipDefaultLibCheck: true,
        suppressOutputPathCheck: true
    });
    if (loaderConfig.transpileOnly) {
        compilerConfig.options.isolatedModules = true;
    }
    _.defaults(compilerConfig.options, {
        sourceRoot: compilerConfig.options.sourceMap ? process.cwd() : undefined
    });
    _.defaults(loaderConfig, {
        sourceMap: true,
        verbose: false,
    });
    delete compilerConfig.options.outDir;
    delete compilerConfig.options.outFile;
    delete compilerConfig.options.out;
    delete compilerConfig.options.noEmit;
}
function absolutize(fileName) {
    if (path.isAbsolute(fileName)) {
        return fileName;
    }
    else {
        return path.join(process.cwd(), fileName);
    }
}
function readConfigFile(baseDir, query, tsImpl) {
    var configFilePath;
    if (query.configFileName && query.configFileName.match(/\.json$/)) {
        configFilePath = absolutize(query.configFileName);
    }
    else {
        configFilePath = tsImpl.findConfigFile(process.cwd(), tsImpl.sys.fileExists);
    }
    var existingOptions = tsImpl.convertCompilerOptionsFromJson(query, process.cwd(), 'atl.query');
    if (!configFilePath || query.configFileContent) {
        return {
            configFilePath: configFilePath || path.join(process.cwd(), 'tsconfig.json'),
            compilerConfig: tsImpl.parseJsonConfigFileContent(query.configFileContent || {}, tsImpl.sys, process.cwd(), _.extend({}, tsImpl.getDefaultCompilerOptions(), existingOptions.options), process.cwd()),
            loaderConfig: query
        };
    }
    var jsonConfigFile = tsImpl.readConfigFile(configFilePath, tsImpl.sys.readFile);
    var compilerConfig = tsImpl.parseJsonConfigFileContent(jsonConfigFile.config, tsImpl.sys, path.dirname(configFilePath), existingOptions.options, configFilePath);
    return {
        configFilePath: configFilePath,
        compilerConfig: compilerConfig,
        loaderConfig: _.defaults(query, jsonConfigFile.config.awesomeTypescriptLoaderOptions)
    };
}
exports.readConfigFile = readConfigFile;
var EXTENSIONS = /\.tsx?$|\.jsx?$/;
function setupWatchRun(compiler, instanceName) {
    compiler.plugin('watch-run', function (watching, callback) {
        var instance = resolveInstance(watching.compiler, instanceName);
        var checker = instance.checker;
        var watcher = watching.compiler.watchFileSystem.watcher || watching.compiler.watchFileSystem.wfs.watcher;
        var mtimes = watcher.mtimes;
        var changedFiles = Object.keys(mtimes).map(helpers_1.toUnix);
        var updates = changedFiles
            .filter(function (file) { return EXTENSIONS.test(file); })
            .map(function (changedFile) {
            if (fs.existsSync(changedFile)) {
                checker.updateFile(changedFile, fs.readFileSync(changedFile).toString());
            }
            else {
                checker.removeFile(changedFile);
            }
        });
        Promise.all(updates)
            .then(function () { return callback(); })
            .catch(callback);
    });
}
var WatchMode;
(function (WatchMode) {
    WatchMode[WatchMode["Enabled"] = 0] = "Enabled";
    WatchMode[WatchMode["Disabled"] = 1] = "Disabled";
    WatchMode[WatchMode["Unknown"] = 2] = "Unknown";
})(WatchMode || (WatchMode = {}));
function isWatching(compiler) {
    var value = compiler && compiler[watch_mode_1.WatchModeSymbol];
    if (value === true) {
        return WatchMode.Enabled;
    }
    else if (value === false) {
        return WatchMode.Disabled;
    }
    else {
        return WatchMode.Unknown;
    }
}
function setupAfterCompile(compiler, instanceName, forkChecker) {
    if (forkChecker === void 0) { forkChecker = false; }
    compiler.plugin('after-compile', function (compilation, callback) {
        if (compilation.compiler.isChild()) {
            callback();
            return;
        }
        var watchMode = isWatching(compilation.compiler);
        var instance = resolveInstance(compilation.compiler, instanceName);
        var silent = instance.loaderConfig.silent;
        var asyncErrors = watchMode === WatchMode.Enabled && !silent;
        var emitError = function (msg) {
            if (compilation.bail) {
                console.error('Error in bail mode:', msg);
                process.exit(1);
            }
            if (asyncErrors) {
                console.log(msg, '\n');
            }
            else {
                compilation.errors.push(new Error(msg));
            }
        };
        instance.compiledFiles = {};
        var files = instance.checker.getFiles()
            .then(function (_a) {
            var files = _a.files;
            Array.prototype.push.apply(compilation.fileDependencies, files.map(path.normalize));
        });
        var diag = instance.loaderConfig.transpileOnly
            ? Promise.resolve()
            : instance.checker.getDiagnostics()
                .then(function (diags) {
                diags.forEach(function (diag) { return emitError(diag.pretty); });
            });
        files
            .then(function () {
            if (asyncErrors) {
                return;
            }
            else {
                return diag;
            }
        })
            .then(function () { return callback(); })
            .catch(callback);
    });
}
//# sourceMappingURL=instance.js.map