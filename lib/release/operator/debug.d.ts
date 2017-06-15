import { Observable } from "rxjs/Observable";
import { Operator } from "rxjs/Operator";
import { Subscriber } from "rxjs/Subscriber";
export declare function debug(name?: string): Observable<any>;
export declare class DebugOperator<T, R> implements Operator<T, R> {
    name: string;
    constructor(name?: string);
    call(subscriber: Subscriber<R>, source: any): any;
}
