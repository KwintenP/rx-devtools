import {Observable} from "rxjs/Observable";
import {Operator} from "rxjs/Operator";
import {Subscriber} from "rxjs/Subscriber";
import uuid from "uuid";

export interface DebugSignature<T> {
  (name?: string): Observable<T>;
}

export function debug<T>(observable: Observable<T>, name: string): Observable<T> {
  // Assign an id to the current observable being lifted. This way we can identify
  // which observable should be debugged.
  (this as any).__rx_observable_dev_tools_id = uuid();
  return this.lift(new DebugOperator(name));
}

export class DebugOperator<T, R> implements Operator<T, R> {
  constructor(public name?: string) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new DebugSubscriber(subscriber));
  }
}

class DebugSubscriber extends Subscriber<any> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value) {
    this.destination.next(value);
  }
}
