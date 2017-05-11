import {Component} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/do";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/filter";
import "../add/operator/debug";
import {createASCII, observables} from "../index";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  observables2 = observables;
  valueSelected;

  constructor(private http: Http) {
    const obs$ = Observable.of(1, 2, 3, 4)
      .debug()
      // .combineLatest(Observable.interval(1000).debug().skip(1).take(2), (val, val2) => val * val2)
      .filter((val) => val % 2 === 0)
      .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
      .map(res => res.json())
      .filter(_ => true)
      .map(val => val.name);

    // const obs$ = Observable.combineLatest(Observable.of(1, 2, 3, 4).debug(), Observable.interval(1000).skip(1).debug().take(5),
    //   (val: number, interval: number) => val * interval)
    //   .debug()
    //   .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
    //   .map(res => res.json())
    //   .map(val => val.name);

    obs$.subscribe(console.log);
  }

  public createASCIIInComponent() {
    createASCII();
  }
}
