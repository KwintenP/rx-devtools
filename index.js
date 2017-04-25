import {Component} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";
import {Operator} from "rxjs/Operator";
import {Subscriber} from "rxjs/Subscriber";
import {MapOperator} from "rxjs/operator/map";
import uuid from "uuid/v1";

const operators: Array<{ operator: string, values: Array<{ time: number, values: Array<string> }> }> = [];

const originalLift = Observable.prototype.lift;
Observable.prototype.lift = function (...args) {
  if (args[0] instanceof DebugOperator) {
    console.log(this.__rx_dev_tools_id);
    const newObs = originalLift.apply(this, args)
    newObs.__rx_dev_tools_id = this.__rx_dev_tools_id;
    operators.push({operator: "debug", values: []});
    return newObs;
  } else {
    if (args[0] instanceof MapOperator) {
      if (this.__rx_dev_tools_id) {
        operators.push({operator: "map" + uuid(), values: []});
      }
    }
    const newObs = originalLift.apply(this, args);
    newObs.__rx_dev_tools_id = this.__rx_dev_tools_id;
    return newObs;
  }
}

const originalMapOperator = MapOperator.prototype.call;
MapOperator.prototype.call = function (subscriber, source) {
  (subscriber as any).__rx_dev_tools_id = source.__rx_dev_tools_id;
  console.log(this.project);
  (subscriber as any).__rx_operator_type = "map";
  return originalMapOperator.call(this, subscriber, source);
};

const next = Subscriber.prototype.next;
Subscriber.prototype.next = function (args) {
  if (this.__rx_dev_tools_id) {
    console.log(this.__rx_dev_tools_id, args);
    console.log(this.__rx_operator_type);

  }
  return next.call(this, args);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private http: Http) {
    const obs$ = this.http.get("http://swapi.co/api/people/1")
      .debug()
      .map(response => response.json())
      .map(_ => "kwinten gij zijt geniaal");

    obs$.subscribe(console.log);
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

