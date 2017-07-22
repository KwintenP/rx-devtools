import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';
export interface DebugSignature<T> {
    (name?: string): Observable<T>;
}
export declare function debug<T>(this: Observable<T>, name: string): Observable<T>;
export declare class DebugOperator<T, R> implements Operator<T, R> {
    name: string;
    constructor(name?: string);
    call(subscriber: Subscriber<R>, source: any): any;
}
