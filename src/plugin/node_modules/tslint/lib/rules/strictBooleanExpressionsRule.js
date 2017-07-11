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
var utils = require("../language/utils");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (srcFile, langSvc) {
        return this.applyWithWalker(new StrictBooleanExpressionsRule(srcFile, this.getOptions(), langSvc.getProgram()));
    };
    return Rule;
}(Lint.Rules.TypedRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "strict-boolean-expressions",
    description: "Usage of && or || operators should be with boolean operands and\nexpressions in If, Do, While and For statements should be of type boolean",
    optionsDescription: "Not configurable.",
    options: null,
    optionExamples: ["true"],
    type: "functionality",
    typescriptOnly: true,
    requiresTypeInfo: true,
};
/* tslint:enable:object-literal-sort-keys */
Rule.BINARY_EXPRESSION_ERROR = "Operands for the && or || operator should be of type boolean";
Rule.UNARY_EXPRESSION_ERROR = "Operand for the ! operator should be of type boolean";
Rule.STATEMENT_ERROR = "statement condition needs to be a boolean expression or literal";
Rule.CONDITIONAL_EXPRESSION_ERROR = "Condition needs to be a boolean expression or literal";
exports.Rule = Rule;
var StrictBooleanExpressionsRule = (function (_super) {
    __extends(StrictBooleanExpressionsRule, _super);
    function StrictBooleanExpressionsRule(srcFile, lintOptions, program) {
        var _this = _super.call(this, srcFile, lintOptions, program) || this;
        _this.checker = _this.getTypeChecker();
        return _this;
    }
    StrictBooleanExpressionsRule.prototype.visitBinaryExpression = function (node) {
        var isAndAndBinaryOperator = node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
        var isOrOrBinaryOperator = node.operatorToken.kind === ts.SyntaxKind.BarBarToken;
        if (isAndAndBinaryOperator || isOrOrBinaryOperator) {
            var lhsExpression = node.left;
            var lhsType = this.checker.getTypeAtLocation(lhsExpression);
            var rhsExpression = node.right;
            var rhsType = this.checker.getTypeAtLocation(rhsExpression);
            if (!this.isBooleanType(lhsType)) {
                if (lhsExpression.kind !== ts.SyntaxKind.BinaryExpression) {
                    this.addFailureAtNode(lhsExpression, Rule.BINARY_EXPRESSION_ERROR);
                }
                else {
                    this.visitBinaryExpression(lhsExpression);
                }
            }
            if (!this.isBooleanType(rhsType)) {
                if (rhsExpression.kind !== ts.SyntaxKind.BinaryExpression) {
                    this.addFailureAtNode(rhsExpression, Rule.BINARY_EXPRESSION_ERROR);
                }
                else {
                    this.visitBinaryExpression(rhsExpression);
                }
            }
        }
        _super.prototype.visitBinaryExpression.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitPrefixUnaryExpression = function (node) {
        var isExclamationOperator = node.operator === ts.SyntaxKind.ExclamationToken;
        if (isExclamationOperator) {
            var expr = node.operand;
            var expType = this.checker.getTypeAtLocation(expr);
            if (!this.isBooleanType(expType)) {
                this.addFailureAtNode(node, Rule.UNARY_EXPRESSION_ERROR);
            }
        }
        _super.prototype.visitPrefixUnaryExpression.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitIfStatement = function (node) {
        this.checkStatement(node);
        _super.prototype.visitIfStatement.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitWhileStatement = function (node) {
        this.checkStatement(node);
        _super.prototype.visitWhileStatement.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitDoStatement = function (node) {
        this.checkStatement(node);
        _super.prototype.visitDoStatement.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitConditionalExpression = function (node) {
        var cexp = node.condition;
        var expType = this.checker.getTypeAtLocation(cexp);
        if (!this.isBooleanType(expType)) {
            this.addFailureAtNode(cexp, Rule.CONDITIONAL_EXPRESSION_ERROR);
        }
        _super.prototype.visitConditionalExpression.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.visitForStatement = function (node) {
        var forCondition = node.condition;
        if (forCondition !== undefined) {
            var expType = this.checker.getTypeAtLocation(forCondition);
            if (!this.isBooleanType(expType)) {
                this.addFailureAtNode(forCondition, "For " + Rule.STATEMENT_ERROR);
            }
        }
        _super.prototype.visitForStatement.call(this, node);
    };
    StrictBooleanExpressionsRule.prototype.checkStatement = function (node) {
        var bexp = node.expression;
        var expType = this.checker.getTypeAtLocation(bexp);
        if (!this.isBooleanType(expType)) {
            this.addFailureAtNode(bexp, failureTextForKind(node.kind) + " " + Rule.STATEMENT_ERROR);
        }
    };
    StrictBooleanExpressionsRule.prototype.isBooleanType = function (btype) {
        return utils.isTypeFlagSet(btype, ts.TypeFlags.BooleanLike);
    };
    return StrictBooleanExpressionsRule;
}(Lint.ProgramAwareRuleWalker));
function failureTextForKind(kind) {
    switch (kind) {
        case ts.SyntaxKind.IfStatement:
            return "If";
        case ts.SyntaxKind.DoStatement:
            return "Do-While";
        case ts.SyntaxKind.WhileStatement:
            return "While";
        default:
            throw new Error("Unknown Syntax Kind");
    }
}
