import {Component} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/filter';
declare const chrome;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private http: Http) {
    var backgroundPageConnection = chrome.runtime.connect({
      name: 'panel'
    });

    console.log('connection made', backgroundPageConnection);

    let callback = (message, sender, sendResponse) => {
      console.log('message received', message, sender, sendResponse);
    };
    backgroundPageConnection.onMessage.addListener(callback as any);

    // const obs$ = Observable.interval(500).map(val => val + 1).take(2).do(console.log)
    //     .concat(Observable.of(1, 2, 3, 4).debug("second"))
    //     .startWith(42)
    //     // .map(([val, val2]) => val * val2)
    //     .filter((val) => val % 2 === 0)
    //     .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
    //     .map(res => res.json())
    //     .filter(_ => true)
    //     .map(val => val.name);

    // const obs$ = Observable.interval(100).debug("first").startWith(0);

    // const obs$ = Observable.combineLatest(Observable.of(1, 2, 3, 4).debug(), Observable.interval(1000).skip(1).debug().take(5),
    //   (val: number, interval: number) => val * interval)
    //   .debug()
    //   .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
    //   .map(res => res.json())
    //   .map(val => val.name);

    // obs$.subscribe(_ => console.log(rxDevtoolsObservables));
  }

}
