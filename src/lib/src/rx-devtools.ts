import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import uuid from 'uuid/v4';
import {DebugOperator} from './operator/debug';
export const monkeyPathOperator = function (operator, observableDevToolsId?) {
  operator.isMonkeyPatched = true;
  const originalOperatorCall = operator.call;
  operator.call = function (subscriber, source) {
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
  Observable.prototype.lift = function (operator: any) {
    // Check if the operator is a debug operator, if so we will:
    // - monkeyPatch the operator to be able to get the values from it
    // - generate an id for the operator and attach it
    // - generate an id for the observable and attach it
    // - send a message to the plugin so the values can be visualised
    if (operator instanceof DebugOperator) {
      if (!(operator as any).monkeyPatched) {
        monkeyPathOperator(operator);
      }
      // Execute the original function and take the resulting observable
      const newObs = originalLift.apply(this, [operator]);
      // Assign the observable dev tools id to the newly lifted observable
      newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      // Generate an operator id and assign it to the operator to link the
      // next event to the correct operator
      (operator as any).__rx_operator_dev_tools_id = "debug-" + uuid();
      (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
      // send it to the content script using the injected script
      const rxDevtoolsObservable = {operators: [], standalone: true, name: operator.name};
      rxDevtoolsObservable.operators.push({
        operatorId: (operator as any).__rx_operator_dev_tools_id,
        values: [],
        operatorName: "debug",
      });
      console.log('send');
      console.log(rxDevtoolsObservable);
      // rxDevtoolsObservables[this.__rx_observable_dev_tools_id] = rxDevtoolsObservable;
      return newObs;
    } else {
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
          let stop = false;
          this.source.array.forEach(obs => {
            if (!obs.__rx_observable_dev_tools_id) {
              stop = true;
            }
          });
          if (stop) {
            return originalLift.apply(this);
          }
          const newObs = originalLift.apply(this);
          // Assign the observable dev tools id to the newly lifted observable
          newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
          return newObs;
        }
        if (!(operator as any).isMonkeyPatched) {
          monkeyPathOperator(operator);
        }
        const operatorName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        (operator as any).__rx_operator_dev_tools_id = operatorName + "-" + uuid();
        console.log('send event');
        console.log({
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: [],
          operatorName: operatorName
        });
        // rxDevtoolsObservables[this.__rx_observable_dev_tools_id].operators.push({
        //   operatorId: (operator as any).__rx_operator_dev_tools_id,
        //   values: [],
        //   operatorName: operatorName
        // });
        (operator as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        const newObs = originalLift.apply(this, [operator]);
        // Assign the observable dev tools id to the next observable as well
        newObs.__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
        return newObs;
      } else if (this.array) {
        if (!(operator as any).isMonkeyPatched) {
          monkeyPathOperator(operator);
        }
        // this is probably an array observable
        // check if all of the source observables are in debug mode
        let stop = false;
        let singleObservableDevtoolsId;
        this.array.forEach(obs => {
          console.log("entered");
          console.log(obs.__rx_observable_dev_tools_id);
          if (!obs.__rx_observable_dev_tools_id) {
            stop = true;
          } else if (obs.__rx_observable_dev_tools_id) {
            console.log("obs.__rx_observable_dev_tools_id");
            singleObservableDevtoolsId = obs.__rx_observable_dev_tools_id;
          }
        });

        if (stop && !singleObservableDevtoolsId) {
          return originalLift.apply(this, [operator]);
        }
        const newObs = originalLift.apply(this, [operator]);
        // Assign the observable dev tools id to the newly lifted observable
        if (stop && singleObservableDevtoolsId) {
          const operatorName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
          (operator as any).__rx_operator_dev_tools_id = operatorName + "-" + uuid();
          console.log('send event');
          console.log({
            operatorId: (operator as any).__rx_operator_dev_tools_id,
            values: [],
            operatorName: operatorName
          });
          // rxDevtoolsObservables[singleObservableDevtoolsId].operators.push({
          //   operatorId: (operator as any).__rx_operator_dev_tools_id,
          //   values: [],
          //   operatorName: operatorName
          // });
          (operator as any).__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          // Assign the observable dev tools id to the next observable as well
          newObs.__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          return newObs;
        } else {
          newObs.__rx_observable_dev_tools_id = uuid();
        }
        if (!(operator as any).isMonkeyPatched) {
          monkeyPathOperator(operator, newObs.__rx_observable_dev_tools_id);
        }

        const opName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        (operator as any).__rx_operator_dev_tools_id = opName + "-" + uuid();
        const rxDevtoolsObservable = {
          operators: [],
          obsParents: [],
          standalone: true,
          name: ""
        };
        rxDevtoolsObservable.operators.push({
          operatorId: (operator as any).__rx_operator_dev_tools_id,
          values: [],
          operatorName: opName
        });
        let name = "";
        this.array.forEach(obs => {
          console.log('send event for parent');
          // const parentRxDevtoolsObservable = rxDevtoolsObservables[obs.__rx_observable_dev_tools_id];
          // name += ((name !== "") ? "-" : "") + parentRxDevtoolsObservable.name;
          // rxDevtoolsObservable.obsParents.push(obs.__rx_observable_dev_tools_id);
          // parentRxDevtoolsObservable.standalone = false;
        });
        name += " " + operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        rxDevtoolsObservable.name = name;
        console.log('send event');
        // rxDevtoolsObservables[newObs.__rx_observable_dev_tools_id] = rxDevtoolsObservable;
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
      console.log('send event');
      // const foundOperator = rxDevtoolsObservables[this.__rx_observable_dev_tools_id].operators.find(operator => {
      //     return operator.operatorId === this.__rx_operator_dev_tools_id;
      //   });
      //   if (foundOperator) {
      //     foundOperator.values.push({percentage, value: args});
      //   }
      // }
      return next.call(this, args);
    }
    ;
  };
}

export const setupRxDevtools = () => {
  monkeyPathNext();
  monkeyPathLift();
}

(window as any).sendMessage('tada');
