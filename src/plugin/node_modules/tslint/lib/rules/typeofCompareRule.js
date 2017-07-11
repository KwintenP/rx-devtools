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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Lint = require("../index");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var comparisonWalker = new ComparisonWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(comparisonWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "typeof-compare",
    description: "Makes sure result of `typeof` is compared to correct string values",
    optionsDescription: "Not configurable.",
    options: null,
    optionExamples: ["true"],
    type: "functionality",
    typescriptOnly: false,
};
/* tslint:enable:object-literal-sort-keys */
Rule.FAILURE_STRING = "typeof must be compared to correct value";
exports.Rule = Rule;
var ComparisonWalker = (function (_super) {
    __extends(ComparisonWalker, _super);
    function ComparisonWalker() {
        return _super.apply(this, arguments) || this;
    }
    ComparisonWalker.isCompareOperator = function (node) {
        return node.kind === ts.SyntaxKind.EqualsEqualsToken || node.kind === ts.SyntaxKind.EqualsEqualsEqualsToken;
    };
    ComparisonWalker.isLegalStringLiteral = function (node) {
        return ComparisonWalker.LEGAL_TYPEOF_RESULTS.indexOf(node.text) > -1;
    };
    ComparisonWalker.isFaultyOtherSideOfTypeof = function (node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral:
                if (!ComparisonWalker.isLegalStringLiteral(node)) {
                    return true;
                }
                break;
            case ts.SyntaxKind.Identifier:
                if (node.originalKeywordKind === ts.SyntaxKind.UndefinedKeyword) {
                    return true;
                }
                break;
            case ts.SyntaxKind.NullKeyword:
            case ts.SyntaxKind.FirstLiteralToken:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.ObjectLiteralExpression:
            case ts.SyntaxKind.ArrayLiteralExpression:
                return true;
            default: break;
        }
        return false;
    };
    ComparisonWalker.prototype.visitBinaryExpression = function (node) {
        var isFaulty = false;
        if (ComparisonWalker.isCompareOperator(node.operatorToken)) {
            // typeof is at left
            if (node.left.kind === ts.SyntaxKind.TypeOfExpression && ComparisonWalker.isFaultyOtherSideOfTypeof(node.right)) {
                isFaulty = true;
            }
            // typeof is at right
            if (node.right.kind === ts.SyntaxKind.TypeOfExpression && ComparisonWalker.isFaultyOtherSideOfTypeof(node.left)) {
                isFaulty = true;
            }
        }
        if (isFaulty) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitBinaryExpression.call(this, node);
    };
    return ComparisonWalker;
}(Lint.RuleWalker));
ComparisonWalker.LEGAL_TYPEOF_RESULTS = ["undefined", "string", "boolean", "number", "function", "object", "symbol"];
