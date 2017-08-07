import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {EVENT_TYPE, RxDevtoolsObservable} from '../../entities/rx-devtools-observable.entity';
declare const chrome;

@Component({
  selector: 'app-marbles-overview',
  templateUrl: './marbles-overview.component.html',
  styleUrls: ['./marbles-overview.component.scss']
})
// TODO: refactor this shitty class. Put data connection in separate service, let it flow with observables to the view layer
export class MarblesOverviewComponent implements OnInit {
  observableSelected: RxDevtoolsObservable;
  time;

  rxDevtoolsObservableData: { [id: string]: RxDevtoolsObservable } = {};
  valueSelected;

  backgroundPageConnection;

  valueToHighlight;

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
              foundOperator.values.push({percentage: message.value.data.percentage, value: message.value.data.value, type: EVENT_TYPE.NEXT});
            }
          }
          break;
        case 'ERROR_EVENT':
          if (this.rxDevtoolsObservableData[message.value.id]) {
            const foundOperator = this.rxDevtoolsObservableData[message.value.id].operators.find(operator => {
              return operator.operatorId === message.value.data.operatorId
            });
            if (foundOperator) {
              foundOperator.values.push({percentage: message.value.data.percentage, value: message.value.data.value, type: EVENT_TYPE.ERROR});
            }
          }
          break;
        case 'COMPLETE_EVENT':
          if (this.rxDevtoolsObservableData[message.value.id]) {
            const foundOperator = this.rxDevtoolsObservableData[message.value.id].operators.find(operator => {
              return operator.operatorId === message.value.data.operatorId
            });
            if (foundOperator) {
              foundOperator.values.push({percentage: message.value.data.percentage, type: EVENT_TYPE.COMPLETE});
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

  getParentObsName(observableId: string) {
    return this.rxDevtoolsObservableData[observableId].name;
  }

  valueSelectedEvent(value) {
    this.valueToHighlight = value;
    this.valueSelected = value.value;
    this.cd.detectChanges();
  }

  parentObsSelected(observableId: string) {
    this.observableSelected = this.rxDevtoolsObservableData[observableId];
  }

  keyValuesOfData() {
    let keys = [];
    Object.keys(this.rxDevtoolsObservableData).forEach((key) => {
      keys.push({key: key, value: this.rxDevtoolsObservableData[key]});
    });
    return keys;
  }

  hasData() {
    return Object.keys(this.rxDevtoolsObservableData).length > 0;
  }

  clearData() {
    this.rxDevtoolsObservableData = {};
    this.valueSelected = undefined;
    this.observableSelected = undefined;

    // this.backgroundPageConnection.postMessage({
    //   name: 'RESET_TIMER',
    //   tabId: chrome.devtools.inspectedWindow.tabId
    // });
  }
}
