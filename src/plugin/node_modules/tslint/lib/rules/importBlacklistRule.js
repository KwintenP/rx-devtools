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
var Lint = require("../index");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.isEnabled = function () {
        var ruleArguments = this.getOptions().ruleArguments;
        return _super.prototype.isEnabled.call(this) && ruleArguments.length > 0;
    };
    Rule.prototype.apply = function (sourceFile) {
        var options = this.getOptions();
        return this.applyWithWalker(new NoRequireFullLibraryWalker(sourceFile, options, options.ruleArguments));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "import-blacklist",
    description: (_a = ["\n            Disallows importing the specified modules directly via `import` and `require`.\n            Instead only sub modules may be imported from that module."], _a.raw = ["\n            Disallows importing the specified modules directly via \\`import\\` and \\`require\\`.\n            Instead only sub modules may be imported from that module."], Lint.Utils.dedent(_a)),
    rationale: (_b = ["\n            Some libraries allow importing their submodules instead of the entire module.\n            This is good practise as it avoids loading unused modules."], _b.raw = ["\n            Some libraries allow importing their submodules instead of the entire module.\n            This is good practise as it avoids loading unused modules."], Lint.Utils.dedent(_b)),
    optionsDescription: "A list of blacklisted modules.",
    options: {
        type: "array",
        items: {
            type: "string",
        },
        minLength: 1,
    },
    optionExamples: ["true", '[true, "rxjs", "lodash"]'],
    type: "functionality",
    typescriptOnly: false,
};
Rule.FAILURE_STRING = "This import is blacklisted, import a submodule instead";
exports.Rule = Rule;
var NoRequireFullLibraryWalker = (function (_super) {
    __extends(NoRequireFullLibraryWalker, _super);
    function NoRequireFullLibraryWalker(sourceFile, options, blacklist) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.blacklist = blacklist;
        return _this;
    }
    NoRequireFullLibraryWalker.prototype.visitCallExpression = function (node) {
        if (node.expression.getText() === "require" &&
            node.arguments &&
            node.arguments[0] &&
            this.isModuleBlacklisted(node.arguments[0].getText())) {
            this.reportFailure(node.arguments[0]);
        }
        _super.prototype.visitCallExpression.call(this, node);
    };
    NoRequireFullLibraryWalker.prototype.visitImportEqualsDeclaration = function (node) {
        var moduleReference = node.moduleReference;
        // If it's an import require and not an import alias
        if (moduleReference.expression) {
            if (this.isModuleBlacklisted(moduleReference.expression.getText())) {
                this.reportFailure(moduleReference.expression);
            }
        }
        _super.prototype.visitImportEqualsDeclaration.call(this, node);
    };
    NoRequireFullLibraryWalker.prototype.visitImportDeclaration = function (node) {
        if (this.isModuleBlacklisted(node.moduleSpecifier.getText())) {
            this.reportFailure(node.moduleSpecifier);
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    NoRequireFullLibraryWalker.prototype.isModuleBlacklisted = function (text) {
        return this.blacklist.some(function (entry) {
            return text.substring(1, text.length - 1) === entry;
        });
    };
    NoRequireFullLibraryWalker.prototype.reportFailure = function (node) {
        this.addFailureAt(
        // take quotes into account
        node.getStart() + 1, node.getWidth() - 2, Rule.FAILURE_STRING);
    };
    return NoRequireFullLibraryWalker;
}(Lint.RuleWalker));
var _a, _b;
