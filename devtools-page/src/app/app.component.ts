import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
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
import {RxDevtoolsObservable} from './entities/rx-devtools-observable.entity';
import {Observable} from 'rxjs/Observable';
declare const chrome;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  observableSelected: RxDevtoolsObservable;
  time;

  rxDevtoolsObservableData: { [id: string]: RxDevtoolsObservable } = {};

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) {
    Observable.interval(100).take(100).subscribe(val => this.time = val);
  }

  ngOnInit() {
    var backgroundPageConnection = chrome.runtime.connect();

    backgroundPageConnection.onMessage.addListener(this.runInZone.bind(this));

    backgroundPageConnection.postMessage({
      name: 'rx-devtools-page-init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  }

  private runInZone(message, sender, sendResponse) {
    this.zone.run(() => this.processMesage(message, sender, sendResponse));
    this.cd.detectChanges();
  }

  private processMesage(message, sender, sendResponse) {
    if (message && message.value && message.value.id) {
      switch (message.name) {
        case 'ADD_OBSERVABLE':
          this.rxDevtoolsObservableData[message.value.id] = message.value.data;
          break;
        case 'ADD_OPERATOR':
          if (this.rxDevtoolsObservableData[message.value.id]) {
            this.rxDevtoolsObservableData[message.value.id].operators.push(message.value.data);
          }
          break;
        case 'NEXT_EVENT':
          if (this.rxDevtoolsObservableData[message.value.id]) {
            const foundOperator = this.rxDevtoolsObservableData[message.value.id].operators.find(operator => {
              return operator.operatorId === message.value.data.operatorId
            });
            if (foundOperator) {
              foundOperator.values.push({percentage: this.time, value: message.value.data.value});
            }
          }
          break;
      }
    }
  }

  observableSelectedInList(observable: RxDevtoolsObservable) {
    console.log('clicked!');
    this.observableSelected = observable;
    this.cd.detectChanges();
  }

  getLastMarbleDiagram(observableId: string) {
    return this.rxDevtoolsObservableData[observableId].operators[this.rxDevtoolsObservableData[observableId].operators.length - 1].values;
  }

  keyValuesOfData() {
    let keys = [];
    Object.keys(this.rxDevtoolsObservableData).forEach((key) => {
      keys.push({key: key, value: this.rxDevtoolsObservableData[key]});
    });
    return keys;
  }
}
