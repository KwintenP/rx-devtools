/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
var path = require("path");
var ts = require("typescript");
function getSourceFile(fileName, source) {
    var normalizedName = path.normalize(fileName).replace(/\\/g, "/");
    var compilerOptions = createCompilerOptions();
    var compilerHost = {
        fileExists: function () { return true; },
        getCanonicalFileName: function (filename) { return filename; },
        getCurrentDirectory: function () { return ""; },
        getDefaultLibFileName: function () { return "lib.d.ts"; },
        getDirectories: function (_path) { return []; },
        getNewLine: function () { return "\n"; },
        getSourceFile: function (filenameToGet) {
            var target = compilerOptions.target == null ? ts.ScriptTarget.ES5 : compilerOptions.target;
            return ts.createSourceFile(filenameToGet, source, target, true);
        },
        readFile: function (x) { return x; },
        useCaseSensitiveFileNames: function () { return true; },
        writeFile: function (x) { return x; },
    };
    var program = ts.createProgram([normalizedName], compilerOptions, compilerHost);
    return program.getSourceFile(normalizedName);
}
exports.getSourceFile = getSourceFile;
function createCompilerOptions() {
    return {
        allowJs: true,
        noResolve: true,
        target: ts.ScriptTarget.ES5,
    };
}
exports.createCompilerOptions = createCompilerOptions;
function doesIntersect(failure, disabledIntervals) {
    return disabledIntervals.some(function (interval) {
        var maxStart = Math.max(interval.startPosition, failure.getStartPosition().getPosition());
        var minEnd = Math.min(interval.endPosition, failure.getEndPosition().getPosition());
        return maxStart <= minEnd;
    });
}
exports.doesIntersect = doesIntersect;
function scanAllTokens(scanner, callback) {
    var lastStartPos = -1;
    while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
        var startPos = scanner.getStartPos();
        if (startPos === lastStartPos) {
            break;
        }
        lastStartPos = startPos;
        callback(scanner);
    }
}
exports.scanAllTokens = scanAllTokens;
/**
 * @returns true if any modifier kinds passed along exist in the given modifiers array
 */
function hasModifier(modifiers) {
    var modifierKinds = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        modifierKinds[_i - 1] = arguments[_i];
    }
    if (modifiers === undefined || modifierKinds.length === 0) {
        return false;
    }
    return modifiers.some(function (m) {
        return modifierKinds.some(function (k) { return m.kind === k; });
    });
}
exports.hasModifier = hasModifier;
/**
 * Determines if the appropriate bit in the parent (VariableDeclarationList) is set,
 * which indicates this is a "let" or "const".
 */
function isBlockScopedVariable(node) {
    var parentNode = (node.kind === ts.SyntaxKind.VariableDeclaration)
        ? node.parent
        : node.declarationList;
    return isNodeFlagSet(parentNode, ts.NodeFlags.Let)
        || isNodeFlagSet(parentNode, ts.NodeFlags.Const);
}
exports.isBlockScopedVariable = isBlockScopedVariable;
function isBlockScopedBindingElement(node) {
    var variableDeclaration = getBindingElementVariableDeclaration(node);
    // if no variable declaration, it must be a function param, which is block scoped
    return (variableDeclaration == null) || isBlockScopedVariable(variableDeclaration);
}
exports.isBlockScopedBindingElement = isBlockScopedBindingElement;
function getBindingElementVariableDeclaration(node) {
    var currentParent = node.parent;
    while (currentParent.kind !== ts.SyntaxKind.VariableDeclaration) {
        if (currentParent.parent == null) {
            return null; // function parameter, no variable declaration
        }
        else {
            currentParent = currentParent.parent;
        }
    }
    return currentParent;
}
exports.getBindingElementVariableDeclaration = getBindingElementVariableDeclaration;
/** Shim of Array.find */
function find(a, predicate) {
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var value = a_1[_i];
        if (predicate(value)) {
            return value;
        }
    }
    return undefined;
}
/**
 * Finds a child of a given node with a given kind.
 * Note: This uses `node.getChildren()`, which does extra parsing work to include tokens.
 */
function childOfKind(node, kind) {
    return find(node.getChildren(), function (child) { return child.kind === kind; });
}
exports.childOfKind = childOfKind;
/**
 * @returns true if some ancestor of `node` satisfies `predicate`, including `node` itself.
 */
function someAncestor(node, predicate) {
    return predicate(node) || (node.parent != null && someAncestor(node.parent, predicate));
}
exports.someAncestor = someAncestor;
function isAssignment(node) {
    if (node.kind === ts.SyntaxKind.BinaryExpression) {
        var binaryExpression = node;
        return binaryExpression.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
            && binaryExpression.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
    }
    else {
        return false;
    }
}
exports.isAssignment = isAssignment;
/**
 * Bitwise check for node flags.
 */
function isNodeFlagSet(node, flagToCheck) {
    /* tslint:disable:no-bitwise */
    return (node.flags & flagToCheck) !== 0;
    /* tslint:enable:no-bitwise */
}
exports.isNodeFlagSet = isNodeFlagSet;
/**
 * Bitwise check for combined node flags.
 */
function isCombinedNodeFlagSet(node, flagToCheck) {
    /* tslint:disable:no-bitwise */
    return (ts.getCombinedNodeFlags(node) & flagToCheck) !== 0;
    /* tslint:enable:no-bitwise */
}
exports.isCombinedNodeFlagSet = isCombinedNodeFlagSet;
/**
 * Bitwise check for combined modifier flags.
 */
function isCombinedModifierFlagSet(node, flagToCheck) {
    /* tslint:disable:no-bitwise */
    return (ts.getCombinedModifierFlags(node) & flagToCheck) !== 0;
    /* tslint:enable:no-bitwise */
}
exports.isCombinedModifierFlagSet = isCombinedModifierFlagSet;
/**
 * Bitwise check for type flags.
 */
function isTypeFlagSet(type, flagToCheck) {
    /* tslint:disable:no-bitwise */
    return (type.flags & flagToCheck) !== 0;
    /* tslint:enable:no-bitwise */
}
exports.isTypeFlagSet = isTypeFlagSet;
/**
 * Bitwise check for object flags.
 * Does not work with TypeScript 2.0.x
 */
function isObjectFlagSet(objectType, flagToCheck) {
    /* tslint:disable:no-bitwise */
    return (objectType.objectFlags & flagToCheck) !== 0;
    /* tslint:enable:no-bitwise */
}
exports.isObjectFlagSet = isObjectFlagSet;
/**
 * @returns true if decl is a nested module declaration, i.e. represents a segment of a dotted module path.
 */
function isNestedModuleDeclaration(decl) {
    // in a declaration expression like 'module a.b.c' - 'a' is the top level module declaration node and 'b' and 'c'
    // are nested therefore we can depend that a node's position will only match with its name's position for nested
    // nodes
    return decl.name.pos === decl.pos;
}
exports.isNestedModuleDeclaration = isNestedModuleDeclaration;
function unwrapParentheses(node) {
    while (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    return node;
}
exports.unwrapParentheses = unwrapParentheses;
function isScopeBoundary(node) {
    return node.kind === ts.SyntaxKind.FunctionDeclaration
        || node.kind === ts.SyntaxKind.FunctionExpression
        || node.kind === ts.SyntaxKind.PropertyAssignment
        || node.kind === ts.SyntaxKind.ShorthandPropertyAssignment
        || node.kind === ts.SyntaxKind.MethodDeclaration
        || node.kind === ts.SyntaxKind.Constructor
        || node.kind === ts.SyntaxKind.ModuleDeclaration
        || node.kind === ts.SyntaxKind.ArrowFunction
        || node.kind === ts.SyntaxKind.ParenthesizedExpression
        || node.kind === ts.SyntaxKind.ClassDeclaration
        || node.kind === ts.SyntaxKind.ClassExpression
        || node.kind === ts.SyntaxKind.InterfaceDeclaration
        || node.kind === ts.SyntaxKind.GetAccessor
        || node.kind === ts.SyntaxKind.SetAccessor
        || node.kind === ts.SyntaxKind.SourceFile && ts.isExternalModule(node);
}
exports.isScopeBoundary = isScopeBoundary;
function isBlockScopeBoundary(node) {
    return isScopeBoundary(node)
        || node.kind === ts.SyntaxKind.Block
        || node.kind === ts.SyntaxKind.DoStatement
        || node.kind === ts.SyntaxKind.WhileStatement
        || node.kind === ts.SyntaxKind.ForStatement
        || node.kind === ts.SyntaxKind.ForInStatement
        || node.kind === ts.SyntaxKind.ForOfStatement
        || node.kind === ts.SyntaxKind.WithStatement
        || node.kind === ts.SyntaxKind.SwitchStatement
        || node.parent !== undefined
            && (node.parent.kind === ts.SyntaxKind.TryStatement
                || node.parent.kind === ts.SyntaxKind.IfStatement);
}
exports.isBlockScopeBoundary = isBlockScopeBoundary;
