import {Observable} from "rxjs/Observable";
import {debug, DebugSignature} from "../../operator/debug";

Observable.prototype.debug = debug;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    debug: DebugSignature<T>;
  }
}

