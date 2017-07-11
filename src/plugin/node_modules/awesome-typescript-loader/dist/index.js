"use strict";
var _ = require("lodash");
var path = require("path");
var cache_1 = require("./cache");
var helpers = require("./helpers");
var instance_1 = require("./instance");
var paths_plugin_1 = require("./paths-plugin");
var watch_mode_1 = require("./watch-mode");
var loaderUtils = require('loader-utils');
function loader(text) {
    try {
        compiler.call(undefined, this, text);
    }
    catch (e) {
        console.error(e, e.stack);
        throw e;
    }
}
(function (loader) {
    loader.TsConfigPathsPlugin = paths_plugin_1.PathsPlugin;
    loader.CheckerPlugin = watch_mode_1.CheckerPlugin;
})(loader || (loader = {}));
function compiler(loader, text) {
    if (loader.cacheable) {
        loader.cacheable();
    }
    var options = loaderUtils.parseQuery(loader.query);
    var instanceName = options.instance || 'at-loader';
    var instance = instance_1.ensureInstance(loader, options, instanceName);
    var callback = loader.async();
    var fileName = helpers.toUnix(loader.resourcePath);
    instance.compiledFiles[fileName] = true;
    var compiledModule;
    if (instance.loaderConfig.usePrecompiledFiles) {
        compiledModule = cache_1.findCompiledModule(fileName);
    }
    var transformation = null;
    if (compiledModule) {
        transformation = Promise.resolve({
            text: compiledModule.text,
            map: compiledModule.map
                ? JSON.parse(compiledModule.map)
                : null
        }).then(function (result) { return ({ cached: true, result: result }); });
    }
    else {
        var transformationFunction = function () { return transform(loader, instance, fileName, text); };
        if (instance.loaderConfig.useCache) {
            transformation = cache_1.cache({
                source: text,
                identifier: instance.cacheIdentifier,
                directory: instance.loaderConfig.cacheDirectory,
                options: loader.query,
                transform: transformationFunction
            });
        }
        else {
            transformation = transformationFunction().then(function (result) { return ({ cached: false, result: result }); });
        }
    }
    transformation
        .then(function (_a) {
        var cached = _a.cached, result = _a.result;
        if (!instance.compilerConfig.options.isolatedModules) {
            result.deps.forEach(function (dep) { return loader.addDependency(path.normalize(dep)); });
        }
        if (cached) {
            instance.checker.updateFile(fileName, text);
        }
        return result;
    })
        .then(function (_a) {
        var text = _a.text, map = _a.map;
        callback(null, text, map);
    })
        .catch(callback)
        .catch(function (e) {
        console.error('Error in bail mode:', e, e.stack.join
            ? e.stack.join('\n')
            : e.stack);
        process.exit(1);
    });
}
function transform(webpack, instance, fileName, text) {
    var resultText;
    var resultSourceMap = null;
    return instance.checker.emitFile(fileName, text).then((function (_a) {
        var emitResult = _a.emitResult, deps = _a.deps;
        resultSourceMap = emitResult.sourceMap;
        resultText = emitResult.text;
        var sourceFileName = fileName.replace(process.cwd() + '/', '');
        if (resultSourceMap) {
            resultSourceMap = JSON.parse(resultSourceMap);
            resultSourceMap.sources = [sourceFileName];
            resultSourceMap.file = sourceFileName;
            resultSourceMap.sourcesContent = [text];
            resultText = resultText.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
        }
        if (instance.loaderConfig.useBabel) {
            var defaultOptions = {
                inputSourceMap: resultSourceMap,
                sourceRoot: process.cwd(),
                filename: fileName,
                sourceMap: true
            };
            var babelOptions = _.assign({}, defaultOptions, instance.loaderConfig.babelOptions);
            var babelResult = instance.babelImpl.transform(resultText, babelOptions);
            resultText = babelResult.code;
            resultSourceMap = babelResult.map;
        }
        if (resultSourceMap) {
            var sourcePath = path.relative(instance.compilerConfig.options.sourceRoot || process.cwd(), loaderUtils.getRemainingRequest(webpack));
            resultSourceMap.sources = [sourcePath];
            resultSourceMap.file = fileName;
            resultSourceMap.sourcesContent = [text];
        }
        return {
            text: resultText,
            map: resultSourceMap,
            deps: deps,
        };
    }));
}
module.exports = loader;
//# sourceMappingURL=index.js.map