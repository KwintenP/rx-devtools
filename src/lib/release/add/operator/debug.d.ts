import { Observable } from "rxjs/Observable";
export declare function debug<T>(this: Observable<T>, name: string): Observable<T>;
declare module 'rxjs/Observable' {
    interface Observable<T> {
        debug: typeof debug;
    }
}
