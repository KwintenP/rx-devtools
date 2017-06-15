import {monkeyPathLift, monkeyPathNext} from "app/util/monkey_patch";

import "./add/operator/debug";
import "./operator/debug";
import "./util/monkey_patch";
import {Observable} from "rxjs/Observable";

export interface RxDevtoolsObservable {
  operators: Array<{ operatorName?: string, operatorId: string, values: Array<{ percentage: number, value: any }> }>;
  obsParents?: string[];
  standalone: boolean;
  name?: string;
};

export const rxDevtoolsObservables: {
  [obsId: string]: RxDevtoolsObservable
} = {};

export let percentage = 0;
const timeWindow = 2500;

Observable.interval(timeWindow / 100)
  .take(100)
  .subscribe((val) => percentage = val);

monkeyPathLift();
monkeyPathNext();

export const createASCII = function () {
  // console.log("rxDevtoolsObservables", rxDevtoolsObservables);
  // rxDevtoolsObservables.forEach((operator) => {
  //   let marbleString = "";
  //   operator.values.forEach((value) => {
  //     if (value.value) {
  //       marbleString += value.value;
  //     } else {
  //       marbleString += "-";
  //     }
  //   })
  //   console.log("marbleString" + marbleString);
  // });
  // for(let key of Object.keys(rxDevtoolsObservables)) {
  //   let operator = rxDevtoolsObservables[key];
  //   if(!operator.standalone) {
  //     console.log("----- Operator "+ Object.keys(rxDevtoolsObservables).indexOf(key) +"----");
  //     generateAscii(operator.rxDevtoolsObservables);
  //   }
  // }
  //
  // for(let key of Object.keys(rxDevtoolsObservables)) {
  //   let operator = rxDevtoolsObservables[key];
  //   if(operator.standalone) {
  //     console.log("----- Combination Operator --------");
  //     generateAscii(operator.rxDevtoolsObservables);
  //   }
  // }

}

const generateAscii = (operators) => {
  const ascii = [];
  let max = 0;
  let min = Infinity;

  let totalTime;
  const operator2 = [...operators];
  operator2.forEach(operator => {
    operator.values.forEach(value => {
      if (value.time > max) {
        max = value.time;
      }
      if (value.time < min) {
        min = value.time;
      }
    });
  });
  totalTime = max - min;
  const divider = totalTime / 20;
  operator2.forEach(operator => {
    ascii.push(operator.operatorId.substring(0, operator.operatorId.indexOf("-")));
    let tempTime;
    let tempString = "";
    for (let i = 0; i < 21; i++) {
      tempTime = min + divider * i;
      if (tempTime < operator.values[0].time) {
        tempString += " - ";
      } else {
        tempString += "V";
        operator.values.splice(0, 1);
      }
      if (operator.values.length === 0) break;
    }
    ascii.push(tempString);
  });
  ascii.forEach(val => console.log(val));
}
