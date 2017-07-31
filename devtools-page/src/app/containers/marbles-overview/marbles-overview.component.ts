import {Component, NgZone, OnInit, ChangeDetectorRef} from '@angular/core';
import {RxDevtoolsObservable} from '../../entities/rx-devtools-observable.entity';
declare const chrome;

@Component({
  selector: 'app-marbles-overview',
  templateUrl: './marbles-overview.component.html',
  styleUrls: ['./marbles-overview.component.css']
})
// TODO: refactor this shitty class. Put data connection in separate service, let it flow with observables to the view layer
export class MarblesOverviewComponent implements OnInit {
  observableSelected: RxDevtoolsObservable;
  time;

  rxDevtoolsObservableData: { [id: string]: RxDevtoolsObservable } = {};
  valueSelected;

  backgroundPageConnection;

  constructor(private zone: NgZone,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.backgroundPageConnection = chrome.runtime.connect();

    this.backgroundPageConnection.onMessage.addListener(this.runInZone.bind(this));

    this.backgroundPageConnection.postMessage({
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
          if (!this.rxDevtoolsObservableData[message.value.id]) {
            this.rxDevtoolsObservableData[message.value.id] = message.value.data;
          } else {
            this.rxDevtoolsObservableData[message.value.id].name = message.value.data.name;
          }
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
              foundOperator.values.push({percentage: message.value.data.percentage, value: message.value.data.value});
            }
          }
          break;
        case 'ADD_ARRAY_OBSERVABLE':
          this.rxDevtoolsObservableData[message.value.id] = message.value.partialRxDevtoolsObservable;
          message.value.obsParents.forEach((parentObsId) => {
            const parentObs = this.rxDevtoolsObservableData[parentObsId];
            parentObs.standalone = false;
            this.rxDevtoolsObservableData[message.value.id].obsParents.push(parentObsId);
          });
      }
    }
  }

  observableSelectedInList(observable: RxDevtoolsObservable) {
    this.observableSelected = observable;
    this.cd.detectChanges();
  }

  getLastMarbleDiagram(observableId: string) {
    return this.rxDevtoolsObservableData[observableId].operators[this.rxDevtoolsObservableData[observableId].operators.length - 1].values;
  }

  valueSelectedEvent(value: string) {
    this.valueSelected = value;
    this.cd.detectChanges();
  }

  keyValuesOfData() {
    let keys = [];
    Object.keys(this.rxDevtoolsObservableData).forEach((key) => {
      keys.push({key: key, value: this.rxDevtoolsObservableData[key]});
    });
    return keys;
  }

  clearData() {
    this.rxDevtoolsObservableData = {};
    this.valueSelected = undefined;
    this.observableSelected = undefined;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
        console.log(response.farewell);
      });
    });
  }
}
