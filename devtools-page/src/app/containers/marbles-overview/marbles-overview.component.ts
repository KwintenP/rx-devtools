import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {EVENT_TYPE, RxDevtoolsObservable} from '../../entities/rx-devtools-observable.entity';
import {StorageService} from '../../services/storage.service';
declare const chrome;

const RESET_TIMER = 'RESET_TIMER';
const SET_RECORDING_TIMER = 'SET_RECORDING_TIMER';
const RX_DEVTOOLS_PAGE_INIT = 'RX_DEVTOOLS_PAGE_INIT';

@Component({
  selector: 'app-marbles-overview',
  templateUrl: './marbles-overview.component.html',
  styleUrls: ['./marbles-overview.component.scss']
})
// TODO: refactor this shitty class. Put data connection in separate service, let it flow with observables to the view layer
export class MarblesOverviewComponent implements OnInit {
  observableSelected: RxDevtoolsObservable;
  recordingTime;

  rxDevtoolsObservableData: { [id: string]: RxDevtoolsObservable } = {};
  valueSelected;

  backgroundPageConnection;

  valueToHighlight;

  constructor(private zone: NgZone,
              private cd: ChangeDetectorRef,
              private storageService: StorageService) {
  }

  ngOnInit() {
    this.backgroundPageConnection = chrome.runtime.connect();

    this.backgroundPageConnection.onMessage.addListener(this.runInZone.bind(this));

    this.sendMessageToLib(RX_DEVTOOLS_PAGE_INIT);

    this.backgroundPageConnection.postMessage({
      name: 'rx-devtools-page-init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    this.storageService.setRecordingTime(15);

    this.storageService.getRecordingTime()
      .take(1)
      .subscribe(recordingTime => this.sendMessageToLib(SET_RECORDING_TIMER, recordingTime));
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
              foundOperator.values.push({
                percentage: message.value.data.percentage,
                value: message.value.data.value,
                type: EVENT_TYPE.NEXT
              });
            }
          }
          break;
        case 'ERROR_EVENT':
          if (this.rxDevtoolsObservableData[message.value.id]) {
            const foundOperator = this.rxDevtoolsObservableData[message.value.id].operators.find(operator => {
              return operator.operatorId === message.value.data.operatorId
            });
            if (foundOperator) {
              foundOperator.values.push({
                percentage: message.value.data.percentage,
                value: message.value.data.value,
                type: EVENT_TYPE.ERROR
              });
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

    this.sendResetTimerToLib();
  }

  clearTimer() {
    this.sendResetTimerToLib();
  }

  private sendResetTimerToLib() {
    this.sendMessageToLib(RESET_TIMER);
  }

  private sendMessageToLib(type: string, value?: any) {
    this.backgroundPageConnection.postMessage({
      type,
      value,
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  }
}
