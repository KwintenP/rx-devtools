import {PartialObserver} from 'rxjs/Observer';
declare const require;
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscriber} from 'rxjs/Subscriber';
import {v4 as uuid} from 'uuid';
import {DebugOperator} from './operator/debug';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/startWith';

export const monkeyPathOperator = function (operator) {
  operator.isMonkeyPatched = true;
  const originalOperatorCall = operator.call;
  operator.call = function (subscriber, source) {
    (subscriber as any).__rx_operator_dev_tools_id = this.__rx_operator_dev_tools_id;
    (subscriber as any).__rx_observable_dev_tools_id = this.__rx_observable_dev_tools_id;
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
      console.log('generated obs id', this.__rx_observable_dev_tools_id);
      sendMessage({name: 'ADD_OBSERVABLE', value: {id: this.__rx_observable_dev_tools_id, data: rxDevtoolsObservable}});
      return newObs;
    } else {
      // if it's an observable we want to debug
      if (this.__rx_observable_dev_tools_id) {
        // if it doesn't have an operator, we are probably dealing with an
        // array observable. In this case we just need to re-assign the
        // observable identifier to the new one
        if (!operator) {
          // check to see if all of the sources are observables we are
          // debugging
          let stop = this.source.array && this.source.array.length === 0;
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
        sendMessage({
          name: 'ADD_OPERATOR', value: {
            id: this.__rx_observable_dev_tools_id, data: {
              operatorId: (operator as any).__rx_operator_dev_tools_id,
              values: [],
              operatorName: operatorName
            }
          }
        });
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
        let stop = this.array && this.array.length === 0;
        let singleObservableDevtoolsId;
        this.array.forEach(obs => {
          if (!obs.__rx_observable_dev_tools_id) {
            stop = true;
          } else if (obs.__rx_observable_dev_tools_id) {
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
          sendMessage({
            name: 'ADD_OPERATOR', value: {
              id: this.__rx_observable_dev_tools_id, data: {
                operatorId: (operator as any).__rx_operator_dev_tools_id,
                values: [],
                operatorName: operatorName
              }
            }
          });
          (operator as any).__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          // Assign the observable dev tools id to the next observable as well
          newObs.__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          return newObs;
        }

        newObs.__rx_observable_dev_tools_id = uuid();
        (operator as any).__rx_observable_dev_tools_id = newObs.__rx_observable_dev_tools_id;
        const opName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        (operator as any).__rx_operator_dev_tools_id = opName + "-" + uuid();
        (operator as any).__rx_observable_dev_tools_id = newObs.__rx_observable_dev_tools_id;
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
        const obsParents = [];
        this.array.forEach(obs => {
          obsParents.push(obs.__rx_observable_dev_tools_id);
        });
        const name = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        sendMessage({
          name: 'ADD_ARRAY_OBSERVABLE',
          value: {
            id: newObs.__rx_observable_dev_tools_id,
            partialRxDevtoolsObservable: rxDevtoolsObservable,
            obsParents,
            name
          }
        })

        return newObs;
      }
      return originalLift.apply(this, [operator]);
    }
  };
};

export const monkeyPathLiftSubject = function () {
  const originalLift = Subject.prototype.lift;
  Subject.prototype.lift = function (operator: any) {
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
      console.log('generated obs id', this.__rx_observable_dev_tools_id);
      sendMessage({name: 'ADD_OBSERVABLE', value: {id: this.__rx_observable_dev_tools_id, data: rxDevtoolsObservable}});
      return newObs;
    } else {
      // if it's an observable we want to debug
      if (this.__rx_observable_dev_tools_id) {
        // if it doesn't have an operator, we are probably dealing with an
        // array observable. In this case we just need to re-assign the
        // observable identifier to the new one
        if (!operator) {
          // check to see if all of the sources are observables we are
          // debugging
          let stop = this.source.array && this.source.array.length === 0;
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
        sendMessage({
          name: 'ADD_OPERATOR', value: {
            id: this.__rx_observable_dev_tools_id, data: {
              operatorId: (operator as any).__rx_operator_dev_tools_id,
              values: [],
              operatorName: operatorName
            }
          }
        });
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
        let stop = this.array && this.array.length === 0;
        let singleObservableDevtoolsId;
        this.array.forEach(obs => {
          if (!obs.__rx_observable_dev_tools_id) {
            stop = true;
          } else if (obs.__rx_observable_dev_tools_id) {
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
          sendMessage({
            name: 'ADD_OPERATOR', value: {
              id: this.__rx_observable_dev_tools_id, data: {
                operatorId: (operator as any).__rx_operator_dev_tools_id,
                values: [],
                operatorName: operatorName
              }
            }
          });
          (operator as any).__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          // Assign the observable dev tools id to the next observable as well
          newObs.__rx_observable_dev_tools_id = singleObservableDevtoolsId;
          return newObs;
        }

        newObs.__rx_observable_dev_tools_id = uuid();
        (operator as any).__rx_observable_dev_tools_id = newObs.__rx_observable_dev_tools_id;
        const opName = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        (operator as any).__rx_operator_dev_tools_id = opName + "-" + uuid();
        (operator as any).__rx_observable_dev_tools_id = newObs.__rx_observable_dev_tools_id;
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
        const obsParents = [];
        this.array.forEach(obs => {
          obsParents.push(obs.__rx_observable_dev_tools_id);
        });
        const name = operator.constructor.name.substring(0, operator.constructor.name.indexOf("Operator"));
        sendMessage({
          name: 'ADD_ARRAY_OBSERVABLE',
          value: {
            id: newObs.__rx_observable_dev_tools_id,
            partialRxDevtoolsObservable: rxDevtoolsObservable,
            obsParents,
            name
          }
        })

        return newObs;
      }
      return originalLift.apply(this, [operator]);
    }
  };
};


let time;

const resetTimer$ = new Subject<string>().startWith('');
resetTimer$
  .switchMap(_ => Observable.interval(150).take(100))
  .subscribe(val => time = val);

export const monkeyPathNext = function () {
  const next = Subscriber.prototype.next;
  Subscriber.prototype.next = function (args) {
    if (this.__rx_observable_dev_tools_id) {
      sendMessage({
        name: 'NEXT_EVENT',
        value: {
          id: this.__rx_observable_dev_tools_id,
          data: {
            operatorId: this.__rx_operator_dev_tools_id,
            value: args,
            percentage: time
          }
        }
      });
    }
    return next.call(this, args);
  };
}

export const setupRxDevtools = () => {
  monkeyPathNext();
  monkeyPathLift();
}

const sendMessage = (message: any) => {
  window.postMessage({
    message,
    source: 'rx-devtools-plugin'
  }, '*');
};

// TODO: when the plugin sends a reset, perform 'resetTimer$.next()' to reset the timer
