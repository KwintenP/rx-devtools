import {Pipe} from "@angular/core";

@Pipe({
  name: 'prettyprint'
})
export class PrettyPrintJsonPipe {
  transform(val) {
    if (val) {
      return JSON.stringify(val, null, 2);
    }
  }
}
