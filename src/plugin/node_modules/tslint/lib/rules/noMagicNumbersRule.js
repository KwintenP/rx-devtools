/**
 * @license
 * Copyright 2016 Palantir Technologies, Inc.
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
        return this.applyWithWalker(new NoMagicNumbersWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "no-magic-numbers",
    description: (_a = ["\n            Disallows the use constant number values outside of variable assignments.\n            When no list of allowed values is specified, -1, 0 and 1 are allowed by default."], _a.raw = ["\n            Disallows the use constant number values outside of variable assignments.\n            When no list of allowed values is specified, -1, 0 and 1 are allowed by default."], Lint.Utils.dedent(_a)),
    rationale: (_b = ["\n            Magic numbers should be avoided as they often lack documentation, forcing\n            them to be stored in variables gives them implicit documentation."], _b.raw = ["\n            Magic numbers should be avoided as they often lack documentation, forcing\n            them to be stored in variables gives them implicit documentation."], Lint.Utils.dedent(_b)),
    optionsDescription: "A list of allowed numbers.",
    options: {
        type: "array",
        items: {
            type: "number",
        },
        minLength: 1,
    },
    optionExamples: ["true", "[true, 1, 2, 3]"],
    type: "typescript",
    typescriptOnly: false,
};
/* tslint:enable:object-literal-sort-keys */
Rule.FAILURE_STRING = "'magic numbers' are not allowed";
Rule.ALLOWED_NODES = (_c = {},
    _c[ts.SyntaxKind.ExportAssignment] = true,
    _c[ts.SyntaxKind.FirstAssignment] = true,
    _c[ts.SyntaxKind.LastAssignment] = true,
    _c[ts.SyntaxKind.PropertyAssignment] = true,
    _c[ts.SyntaxKind.ShorthandPropertyAssignment] = true,
    _c[ts.SyntaxKind.VariableDeclaration] = true,
    _c[ts.SyntaxKind.VariableDeclarationList] = true,
    _c[ts.SyntaxKind.EnumMember] = true,
    _c[ts.SyntaxKind.PropertyDeclaration] = true,
    _c);
Rule.DEFAULT_ALLOWED = [-1, 0, 1];
exports.Rule = Rule;
var NoMagicNumbersWalker = (function (_super) {
    __extends(NoMagicNumbersWalker, _super);
    function NoMagicNumbersWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        // lookup object for allowed magic numbers
        _this.allowed = {};
        var configOptions = _this.getOptions();
        var allowedNumbers = configOptions.length > 0 ? configOptions : Rule.DEFAULT_ALLOWED;
        allowedNumbers.forEach(function (value) {
            _this.allowed[value] = true;
        });
        return _this;
    }
    NoMagicNumbersWalker.prototype.visitNode = function (node) {
        var isUnary = this.isUnaryNumericExpression(node);
        if (node.kind === ts.SyntaxKind.NumericLiteral && node.parent !== undefined && !Rule.ALLOWED_NODES[node.parent.kind] || isUnary) {
            var text = node.getText();
            if (!this.allowed[text]) {
                this.addFailureAtNode(node, Rule.FAILURE_STRING);
            }
        }
        if (!isUnary) {
            _super.prototype.visitNode.call(this, node);
        }
    };
    /**
     * Checks if a node is an unary expression with on a numeric operand.
     */
    NoMagicNumbersWalker.prototype.isUnaryNumericExpression = function (node) {
        if (node.kind !== ts.SyntaxKind.PrefixUnaryExpression) {
            return false;
        }
        var unaryNode = node;
        return unaryNode.operator === ts.SyntaxKind.MinusToken && unaryNode.operand.kind === ts.SyntaxKind.NumericLiteral;
    };
    return NoMagicNumbersWalker;
}(Lint.RuleWalker));
var _a, _b, _c;
