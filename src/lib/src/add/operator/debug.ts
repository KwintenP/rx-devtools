import {Observable} from "rxjs/Observable";
import {debug as _debug} from "../../operator/debug";

export function debug<T>(this: Observable<T>, name: string): Observable<T> {
  return _debug(this, name);
}

Observable.prototype.debug = debug;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    debug: typeof debug;
  }
}
