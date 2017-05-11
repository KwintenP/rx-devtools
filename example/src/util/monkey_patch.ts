import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {DebugOperator} from "../operator/debug";
import uuid from "uuid/v4";
import {observables, percentage} from "../index";
export const monkeyPathOperator = function (operator, observableDevToolsId?) {
  const originalOperatorCall = operator.call;
  operator.call = function (subscriber, source) {
    // Take the operator devtools id and assign it to the subscriber. This is used to assign the
    // 'next' on the subscriber to the correct operator in the chain.

    (subscriber as any).__rx_operator_dev_tools_id = this.__rx_operator_dev_tools_id;
    if (!observableDevToolsId) {
      (subscriber as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
    } else {
      (subscriber as any).__rx_observable_dev_tools_id = observableDevToolsId;
    }
    return originalOperatorCall.call(this, subscriber, source);
  };
};

export const monkeyPathLift = function () {
  const originalLift = Observable.prototype.lift;
  Observable.prototype.lift = function (operator) {
    if (operator instanceof DebugOperator) {
      monkeyPathOperator(operator);
      const newObs = originalLift.apply(this, [operator]);
      // Assign the observable dev tools id to the newly lifted observable
      newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      // Generate an operator id and assign it to the operator to link the next event to the correct operator
      (operator as any).__rx_operator_dev_tools_id = "debug-" + uuid();
      (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      if (observables[this.__rx_observable_dev_tools_id]) {
        observables[this.__rx_observable_dev_tools_id].operators.push({
          operatorName: "debug",
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: []
        });
      } else {
        console.log("entered here");
        observables[this.__rx_observable_dev_tools_id] = {operators: [], standalone: true};
        observables[this.__rx_observable_dev_tools_id].operators.push({
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: [],
          operatorName: "debug",
        });
      }
      return newObs;
    } else {
      // if it's an observable we want to debug
      if (this.__rx_observable_dev_tools_id) {
        monkeyPathOperator(operator);
        // Add all the next observables to it
        (operator as any).__rx_operator_dev_tools_id =
          operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator")) + "-" + uuid();
        if (!observables[this.__rx_observable_dev_tools_id]) {
          observables[this.__rx_observable_dev_tools_id] = {operators: [], standalone: true};
        }
        observables[this.__rx_observable_dev_tools_id].operators.push({
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: [],
          operatorName: operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"))
        });
        (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        const newObs = originalLift.apply(this, [operator]);
        // Assign the observable dev tools id to the next observable as well
        newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        return newObs;
      } else if (this.array) {
        // this is probably an array observable. We can take these observables unique ID and assign it to the next one
        let stop = false;
        this.array.forEach(obs => {
          if (!obs.__rx_observable_dev_tools_id) {
            stop = true;
          }
        });
        if (stop) {
          return originalLift.apply(this, [operator]);
        }


        const newObs = originalLift.apply(this, [operator]);
        // Assign the observable dev tools id to the newly lifted observable
        newObs.__rx_observable_dev_tools_id = uuid();
        monkeyPathOperator(operator, newObs.__rx_observable_dev_tools_id);
        (operator as any).__rx_operator_dev_tools_id =
          operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator")) + "-" + uuid();
        observables[newObs.__rx_observable_dev_tools_id] = {operators: [], obsParents: [], standalone: true};
        observables[newObs.__rx_observable_dev_tools_id].operators.push({
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: [],
        });
        this.array.forEach(obs => {
          observables[newObs.__rx_observable_dev_tools_id].obsParents.push(obs.__rx_observable_dev_tools_id);
          observables[obs.__rx_observable_dev_tools_id].standalone = false;
        });
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
      const foundOperator = observables[this.__rx_observable_dev_tools_id].operators.find(operator => {
        return operator.operatorId === this.__rx_operator_dev_tools_id;
      });
      if (foundOperator) {
        foundOperator.values.push({percentage, value: args});
      }
    }
    return next.call(this, args);
  };
};
