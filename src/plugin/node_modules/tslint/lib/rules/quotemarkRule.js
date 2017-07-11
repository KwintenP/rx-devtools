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
var QuoteMark;
(function (QuoteMark) {
    QuoteMark[QuoteMark["SINGLE_QUOTES"] = 0] = "SINGLE_QUOTES";
    QuoteMark[QuoteMark["DOUBLE_QUOTES"] = 1] = "DOUBLE_QUOTES";
})(QuoteMark || (QuoteMark = {}));
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.isEnabled = function () {
        if (_super.prototype.isEnabled.call(this)) {
            var ruleArguments = this.getOptions().ruleArguments;
            var quoteMarkString = ruleArguments[0];
            return (quoteMarkString === "single" || quoteMarkString === "double");
        }
        return false;
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new QuotemarkWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "quotemark",
    description: "Requires single or double quotes for string literals.",
    hasFix: true,
    optionsDescription: (_a = ["\n            Five arguments may be optionally provided:\n\n            * `\"single\"` enforces single quotes.\n            * `\"double\"` enforces double quotes.\n            * `\"jsx-single\"` enforces single quotes for JSX attributes.\n            * `\"jsx-double\"` enforces double quotes for JSX attributes.\n            * `\"avoid-escape\"` allows you to use the \"other\" quotemark in cases where escaping would normally be required.\n            For example, `[true, \"double\", \"avoid-escape\"]` would not report a failure on the string literal `'Hello \"World\"'`."], _a.raw = ["\n            Five arguments may be optionally provided:\n\n            * \\`\"single\"\\` enforces single quotes.\n            * \\`\"double\"\\` enforces double quotes.\n            * \\`\"jsx-single\"\\` enforces single quotes for JSX attributes.\n            * \\`\"jsx-double\"\\` enforces double quotes for JSX attributes.\n            * \\`\"avoid-escape\"\\` allows you to use the \"other\" quotemark in cases where escaping would normally be required.\n            For example, \\`[true, \"double\", \"avoid-escape\"]\\` would not report a failure on the string literal \\`'Hello \"World\"'\\`."], Lint.Utils.dedent(_a)),
    options: {
        type: "array",
        items: {
            type: "string",
            enum: ["single", "double", "jsx-single", "jsx-double", "avoid-escape"],
        },
        minLength: 0,
        maxLength: 5,
    },
    optionExamples: ['[true, "single", "avoid-escape"]', '[true, "single", "jsx-double"]'],
    type: "style",
    typescriptOnly: false,
};
/* tslint:enable:object-literal-sort-keys */
Rule.SINGLE_QUOTE_FAILURE = "\" should be '";
Rule.DOUBLE_QUOTE_FAILURE = "' should be \"";
exports.Rule = Rule;
var QuotemarkWalker = (function (_super) {
    __extends(QuotemarkWalker, _super);
    function QuotemarkWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.quoteMark = QuoteMark.DOUBLE_QUOTES;
        var ruleArguments = _this.getOptions();
        if (ruleArguments.indexOf("single") > -1) {
            _this.quoteMark = QuoteMark.SINGLE_QUOTES;
        }
        if (ruleArguments.indexOf("jsx-single") > -1) {
            _this.jsxQuoteMark = QuoteMark.SINGLE_QUOTES;
        }
        else if (ruleArguments.indexOf("jsx-double") > -1) {
            _this.jsxQuoteMark = QuoteMark.DOUBLE_QUOTES;
        }
        else {
            _this.jsxQuoteMark = _this.quoteMark;
        }
        _this.avoidEscape = ruleArguments.indexOf("avoid-escape") > 0;
        return _this;
    }
    QuotemarkWalker.prototype.visitStringLiteral = function (node) {
        var inJsx = (node.parent !== undefined && node.parent.kind === ts.SyntaxKind.JsxAttribute);
        var text = node.getText();
        var width = node.getWidth();
        var position = node.getStart();
        var firstCharacter = text.charAt(0);
        var lastCharacter = text.charAt(text.length - 1);
        var quoteMark = inJsx ? this.jsxQuoteMark : this.quoteMark;
        var expectedQuoteMark = (quoteMark === QuoteMark.SINGLE_QUOTES) ? "'" : "\"";
        if (firstCharacter !== expectedQuoteMark || lastCharacter !== expectedQuoteMark) {
            // allow the "other" quote mark to be used, but only to avoid having to escape
            var includesOtherQuoteMark = text.slice(1, -1).indexOf(expectedQuoteMark) !== -1;
            if (!(this.avoidEscape && includesOtherQuoteMark)) {
                var failureMessage = (quoteMark === QuoteMark.SINGLE_QUOTES)
                    ? Rule.SINGLE_QUOTE_FAILURE
                    : Rule.DOUBLE_QUOTE_FAILURE;
                var newText = expectedQuoteMark
                    + text.slice(1, -1).replace(new RegExp(expectedQuoteMark, "g"), "\\" + expectedQuoteMark)
                    + expectedQuoteMark;
                var fix = this.createFix(this.createReplacement(position, width, newText));
                this.addFailureAt(position, width, failureMessage, fix);
            }
        }
        _super.prototype.visitStringLiteral.call(this, node);
    };
    return QuotemarkWalker;
}(Lint.RuleWalker));
var _a;
