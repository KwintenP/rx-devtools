import { DebugSignature } from "../../operator/debug";
declare module 'rxjs/Observable' {
    interface Observable<T> {
        debug: DebugSignature<T>;
    }
}
