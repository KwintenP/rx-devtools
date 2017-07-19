import { debug } from "../../operator/debug";
declare module 'rxjs/Observable' {
    interface Observable<T> {
        debug: typeof debug;
    }
}
