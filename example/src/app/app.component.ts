import {Component} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";
import {Operator} from "rxjs/Operator";
import {Subscriber} from "rxjs/Subscriber";
import {MapOperator} from "rxjs/operator/map";
import {MergeMapOperator} from "rxjs/operator/mergeMap";
import uuid from "uuid/v1";
import "rxjs/add/observable/of";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/mergeMap";

const operators: Array<{ operatorId: string, values: Array<{ time: number, value: any }> }> = [];

const originalLift = Observable.prototype.lift;
Observable.prototype.lift = function (...args) {
  if (args[0] instanceof DebugOperator) {
    const newObs = originalLift.apply(this, args)
    // Generate and assign a Rx Devtools id and add it to the observable
    newObs.__rx_dev_tools_id = this.__rx_dev_tools_id;
    // operators.push({operator: "debug", values: []});
    args[0].__rx_operator_id = "debug-" + uuid();
    operators.push({operatorId: args[0].__rx_operator_id, values: []});
    return newObs;
  } else {
    // if it's an observable we want to debug
    if (this.__rx_dev_tools_id) {
      // Add all the next operators to it
      if (args[0] instanceof MapOperator) {
        // Add the operator and the unique devtools observable key to the operator
        args[0].__rx_operator_id = "map-" + uuid();
        operators.push({operatorId: args[0].__rx_operator_id, values: []});
      }
      if (args[0] instanceof MergeMapOperator) {
        // Add the operator and the unique devtools observable key to the operator
        args[0].__rx_operator_id = "mergeMap-" + uuid();
        operators.push({operatorId: args[0].__rx_operator_id, values: []});
      }
    }
    const newObs = originalLift.apply(this, args);
    // Assign the observable dev tools id to the next observable as well
    newObs.__rx_dev_tools_id = this.__rx_dev_tools_id;
    return newObs;
  }
}

const originalMapOperator = MapOperator.prototype.call;
MapOperator.prototype.call = function (subscriber, source) {
  (subscriber as any).__rx_operator_id = this.__rx_operator_id;
  return originalMapOperator.call(this, subscriber, source);
};

const originalMergeMapOperator = MergeMapOperator.prototype.call;
MergeMapOperator.prototype.call = function (subscriber, source) {
  (subscriber as any).__rx_operator_id = this.__rx_operator_id;
  return originalMergeMapOperator.call(this, subscriber, source);
};

const next = Subscriber.prototype.next;
Subscriber.prototype.next = function (args) {
  if (this.__rx_operator_id) {
    const foundOperator = operators.find(operator => {
      console.log(operator.operatorId.trim() === this.__rx_operator_id.trim());
      console.log("'" + operator.operatorId + "'");
      console.log("'" + this.__rx_operator_id + "'");
      return operator.operatorId === this.__rx_operator_id;
    });
    if (foundOperator) {
      console.log("foundOperator", foundOperator);
      foundOperator.values.push({time: new Date().getTime(), value: args});
    }
    console.log("logging out this stuff");
    console.log(this.__rx_operator_id);
    console.log(operators);
  }
  return next.call(this, args);
}

const createASCII = function () {
  const ascii = [];
  let max = 0;
  let min = Infinity;

  let totalTime;
  const operator2 = [...operators];
  operator2.forEach(operator => {
    operator.values.forEach(value => {
      if (value.time > max) {
        max = value.time;
      }
      if (value.time < min) {
        min = value.time;
      }
    });
  });
  console.log("min max", min, max);
  totalTime = max - min;
  console.log("zeropoint", totalTime);
  const divider = totalTime / 20;
  operator2.forEach(operator => {
    ascii.push(operator.operatorId.substring(0, operator.operatorId.indexOf("-")));
    let tempTime;
    let tempString = "";
    for (let i = 0; i < 20; i++) {
      tempTime = min + divider * i;
      if (tempTime < operator.values[0].time) {
        tempString += " - ";
      } else {
        tempString += "V";
        operator.values.splice(0, 1);
      }
      if (operator.values.length === 0) break;
    }
    ascii.push(tempString);
  });
  console.log(ascii);
  ascii.forEach(val => console.log(val));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  private operators2 = operators;

  constructor(private http: Http) {
    const obs$ = Observable.of("1", "2", "3", "4")
      .debug()
      .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
      .map(res => res.json())
      .map(val => val.name);

    obs$.subscribe(console.log);
  }

  public createASCIIInComponent() {
    createASCII();
  }
}


export function debug(): Observable<any> {
  (<any>this).__rx_dev_tools_id = uuid();
  return this.lift(new DebugOperator());
}

export class DebugOperator<T, R> implements Operator<T, R> {
  constructor() {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    (subscriber as any).__rx_operator_id = (this as any).__rx_operator_id;
    return source.subscribe(new DebugSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DebugSubscriber extends Subscriber<any> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value) {
    this.destination.next(value);
  }
}


Observable.prototype.debug = debug;

declare module '../../node_modules/rxjs/Observable' {
  interface Observable<T> {
    debug: typeof debug;
  }
}
