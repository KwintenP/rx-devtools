import {Pipe} from '@angular/core';

@Pipe({
  name: 'prettyprint'
})
export class PrettyPrintJsonPipe {
  transform(val) {
    return JSON.stringify(val, null, 2);
  }
}
