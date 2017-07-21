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
  message = 'start';
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
    this.message = message;
    const messageContent = message.message;
    if (messageContent && messageContent.value && messageContent.value.id) {
      switch (messageContent.name) {
        case 'ADD_OBSERVABLE':
          this.rxDevtoolsObservableData[messageContent.value.id] = messageContent.value.data;
          break;
        case 'ADD_OPERATOR':
          if (this.rxDevtoolsObservableData[messageContent.value.id]) {
            this.rxDevtoolsObservableData[messageContent.value.id].operators.push(messageContent.value.data);
          }
          break;
        case 'NEXT_EVENT':
          if (this.rxDevtoolsObservableData[messageContent.value.id]) {
            const foundOperator = this.rxDevtoolsObservableData[messageContent.value.id].operators.find(operator => {
              return operator.operatorId === messageContent.value.data.operatorId
            });
            if (foundOperator) {
              foundOperator.values.push({percentage: this.time, value: messageContent.value.data.value});
            }
          }
          break;
      }
    }
    // const foundOperator = rxDevtoolsObservables[this.__rx_observable_dev_tools_id].operators.find(operator => {
    //     return operator.operatorId === this.__rx_operator_dev_tools_id;
    //   });
    //   if (foundOperator) {
    //     foundOperator.values.push({percentage, value: args});
    //   }
    // }
  }

  observableSelectedInList(observable: RxDevtoolsObservable) {
    this.observableSelected = observable;
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
