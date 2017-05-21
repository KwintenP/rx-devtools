import {Observable} from "rxjs/Observable";
import {debug} from "../../operator/debug";

Observable.prototype.debug = debug;

declare module '../../../node_modules/rxjs/Observable' {
  interface Observable<T> {
    debug: typeof debug;
  }
}
