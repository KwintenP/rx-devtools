import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {DebugOperator} from "../operator/debug";
import uuid from "uuid/v1";
import {MapOperator} from "rxjs/operator/map";
import {MergeMapOperator} from "rxjs/operator/mergeMap";
import {operators} from "../index";
export const monkeyPathOperator = function (operator) {
  const originalOperatorCall = operator.prototype.call;
  operator.prototype.call = function (subscriber, source) {
    // Take the operator devtools id and assign it to the subscriber. This is used to assign the
    // 'next' on the subscriber to the correct operator in the chain.
    (subscriber as any).__rx_operator_dev_tools_id = this.__rx_operator_dev_tools_id;
    (subscriber as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
    return originalOperatorCall.call(this, subscriber, source);
  };
};

export const monkeyPathLift = function () {
  const originalLift = Observable.prototype.lift;
  Observable.prototype.lift = function (operator) {
    if (operator instanceof DebugOperator) {
      const newObs = originalLift.apply(this, [operator])
      // Assign the observable dev tools id to the newly lifted observable
      newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      // Generate an operator id and assign it to the operator to link the next event to the correct operator
      (operator as any).__rx_operator_dev_tools_id = "debug-" + uuid();
      (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      operators.push({operatorId: (operator as any).__rx_operator_dev_tools_id, values: []});
      return newObs;
    } else {
      // if it's an observable we want to debug
      if (this.__rx_observable_dev_tools_id) {
        // Add all the next operators to it
        if (operator instanceof MapOperator) {
          // Add the operator and the unique devtools observable key to the operator
          (operator as any).__rx_operator_dev_tools_id = "map-" + uuid();
          operators.push({operatorId: (operator as any).__rx_operator_dev_tools_id, values: []});
        }
        if (operator instanceof MergeMapOperator) {
          // Add the operator and the unique devtools observable key to the operator
          (operator as any).__rx_operator_dev_tools_id = "mergeMap-" + uuid();
          operators.push({operatorId: (operator as any).__rx_operator_dev_tools_id, values: []});
        }
        (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        const newObs = originalLift.apply(this, [operator]);
        // Assign the observable dev tools id to the next observable as well
        newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        return newObs;
      }
      return originalLift.apply(this, [operator]);
    }
  };
};

export const monkeyPathNext = function () {
  const next = Subscriber.prototype.next;
  Subscriber.prototype.next = function (args) {
    if (this.__rx_observable_dev_tools_id) {
      const foundOperator = operators.find(operator => {
        return operator.operatorId === this.__rx_operator_dev_tools_id;
      });
      if (foundOperator) {
        foundOperator.values.push({time: new Date().getTime(), value: args});
      }
    }
    return next.call(this, args);
  };
}
