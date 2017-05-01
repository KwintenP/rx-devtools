import {Component} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import "../../../src/index";
import "../../../src/add/operator/debug";
import {createASCII} from "../../../src/index";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private http: Http) {
    const obs$ = Observable.of("1", "2", "3", "4")
      .debug()
      .mergeMap(val => http.get("http://swapi.co/api/people/" + val))
      .map(res => res.json())
      .map(val => val.name);

    obs$.subscribe(console.log);
  }

  public createASCIIInComponent() {
    createASCII();
  }
}
