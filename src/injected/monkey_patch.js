"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Subscriber_1 = require("rxjs/Subscriber");
var v4_1 = require("uuid/v4");
var index_1 = require("../index");
var debug_1 = require("rx-devtools/operator/debug");
exports.monkeyPathOperator = function (operator, observableDevToolsId) {
    operator.monkeyPatched = true;
    var originalOperatorCall = operator.call;
    operator.call = function (subscriber, source) {
        subscriber.__rx_operator_dev_tools_id = this.__rx_operator_dev_tools_id;
        if (!observableDevToolsId) {
            subscriber.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        }
        else {
            subscriber.__rx_observable_dev_tools_id = observableDevToolsId;
        }
        return originalOperatorCall.call(this, subscriber, source);
    };
};
exports.monkeyPathLift = function () {
    var originalLift = Observable_1.Observable.prototype.lift;
    Observable_1.Observable.prototype.lift = function (operator) {
        // Check if the operator is a debug operator, if so we will:
        // - monkeyPatch the operator to be able to get the values from it
        // - generate an id for the operator and attach it
        // - generate an id for the observable and attach it
        // - add a new rxDevToolsObservable entry
        if (operator instanceof debug_1.DebugOperator) {
            if (!operator.monkeyPatched) {
                exports.monkeyPathOperator(operator);
            }
            // Execute the original function and take the resulting observable
            var newObs = originalLift.apply(this, [operator]);
            // Assign the observable dev tools id to the newly lifted observable
            newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
            // Generate an operator id and assign it to the operator to link the
            // next event to the correct operator
            operator.__rx_operator_dev_tools_id = "debug-" + v4_1.default();
            operator.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
            // Add it to the rxDevtoolsObservables object
            var rxDevtoolsObservable = { operators: [], standalone: true, name: operator.name };
            rxDevtoolsObservable.operators.push({
                operatorId: operator.__rx_operator_dev_tools_id,
                values: [],
                operatorName: "debug",
            });
            index_1.rxDevtoolsObservables[this.__rx_observable_dev_tools_id] = rxDevtoolsObservable;
            console.log("did", newObs.__rx_observable_dev_tools_id);
            return newObs;
        }
        else {
            console.log("operator", operator);
            console.log("did", this.__rx_observable_dev_tools_id);
            // if it's an observable we want to debug
            if (this.__rx_observable_dev_tools_id) {
                // if it doesn't have en operator, we are probably dealing with an
                // array observable. In this case we just need to re-assign the
                // observable identifier to the new one
                console.log("operator", operator);
                if (!operator) {
                    // check to see if all of the sources are observables we are
                    // debugging
                    var stop_1 = false;
                    this.source.array.forEach(function (obs) {
                        if (!obs.__rx_observable_dev_tools_id) {
                            stop_1 = true;
                        }
                    });
                    if (stop_1) {
                        return originalLift.apply(this);
                    }
                    var newObs_1 = originalLift.apply(this);
                    // Assign the observable dev tools id to the newly lifted observable
                    newObs_1.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
                    return newObs_1;
                }
                if (!operator.monkeyPatched) {
                    exports.monkeyPathOperator(operator);
                }
                var operatorName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
                operator.__rx_operator_dev_tools_id = operatorName + "-" + v4_1.default();
                index_1.rxDevtoolsObservables[this.__rx_observable_dev_tools_id].operators.push({
                    operatorId: operator.__rx_operator_dev_tools_id,
                    values: [],
                    operatorName: operatorName
                });
                operator.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
                var newObs = originalLift.apply(this, [operator]);
                // Assign the observable dev tools id to the next observable as well
                newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
                return newObs;
            }
            else if (this.array) {
                if (!operator.monkeyPatched) {
                    exports.monkeyPathOperator(operator);
                }
                // this is probably an array observable
                // check if all of the source observables are in debug mode
                var stop_2 = false;
                var singleObservableDevtoolsId_1;
                this.array.forEach(function (obs) {
                    console.log("entered");
                    console.log(obs.__rx_observable_dev_tools_id);
                    if (!obs.__rx_observable_dev_tools_id) {
                        stop_2 = true;
                    }
                    else if (obs.__rx_observable_dev_tools_id) {
                        console.log("obs.__rx_observable_dev_tools_id");
                        singleObservableDevtoolsId_1 = obs.__rx_observable_dev_tools_id;
                    }
                });
                if (stop_2 && !singleObservableDevtoolsId_1) {
                    return originalLift.apply(this, [operator]);
                }
                var newObs = originalLift.apply(this, [operator]);
                // Assign the observable dev tools id to the newly lifted observable
                if (stop_2 && singleObservableDevtoolsId_1) {
                    var operatorName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
                    operator.__rx_operator_dev_tools_id = operatorName + "-" + v4_1.default();
                    console.log("operators", index_1.rxDevtoolsObservables);
                    console.log("thi", singleObservableDevtoolsId_1);
                    console.log("mq", index_1.rxDevtoolsObservables);
                    index_1.rxDevtoolsObservables[singleObservableDevtoolsId_1].operators.push({
                        operatorId: operator.__rx_operator_dev_tools_id,
                        values: [],
                        operatorName: operatorName
                    });
                    operator.__rx_observable_dev_tools_id = singleObservableDevtoolsId_1;
                    // Assign the observable dev tools id to the next observable as well
                    newObs.__rx_observable_dev_tools_id = singleObservableDevtoolsId_1;
                    return newObs;
                }
                else {
                    newObs.__rx_observable_dev_tools_id = v4_1.default();
                }
                if (!operator.monkeyPathed) {
                    exports.monkeyPathOperator(operator, newObs.__rx_observable_dev_tools_id);
                }
                var opName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
                operator.__rx_operator_dev_tools_id = opName + "-" + v4_1.default();
                var rxDevtoolsObservable_1 = {
                    operators: [],
                    obsParents: [],
                    standalone: true,
                    name: ""
                };
                rxDevtoolsObservable_1.operators.push({
                    operatorId: operator.__rx_operator_dev_tools_id,
                    values: [],
                    operatorName: opName
                });
                var name_1 = "";
                this.array.forEach(function (obs) {
                    var parentRxDevtoolsObservable = index_1.rxDevtoolsObservables[obs.__rx_observable_dev_tools_id];
                    name_1 += ((name_1 !== "") ? "-" : "") + parentRxDevtoolsObservable.name;
                    rxDevtoolsObservable_1.obsParents.push(obs.__rx_observable_dev_tools_id);
                    parentRxDevtoolsObservable.standalone = false;
                });
                name_1 += " " + operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
                rxDevtoolsObservable_1.name = name_1;
                index_1.rxDevtoolsObservables[newObs.__rx_observable_dev_tools_id] = rxDevtoolsObservable_1;
                return newObs;
            }
            return originalLift.apply(this, [operator]);
        }
    };
};
exports.monkeyPathNext = function () {
    var next = Subscriber_1.Subscriber.prototype.next;
    Subscriber_1.Subscriber.prototype.next = function (args) {
        var _this = this;
        if (this.__rx_observable_dev_tools_id) {
            var foundOperator = index_1.rxDevtoolsObservables[this.__rx_observable_dev_tools_id].operators.find(function (operator) {
                return operator.operatorId === _this.__rx_operator_dev_tools_id;
            });
            if (foundOperator) {
                foundOperator.values.push({ percentage: index_1.percentage, value: args });
            }
        }
        return next.call(this, args);
    };
};
