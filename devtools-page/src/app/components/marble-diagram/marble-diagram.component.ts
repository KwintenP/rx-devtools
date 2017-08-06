import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {EVENT_TYPE} from '../../entities/rx-devtools-observable.entity';

@Component({
  selector: 'app-marble-diagram',
  templateUrl: './marble-diagram.component.html',
  styleUrls: ['./marble-diagram.component.css']
})
export class MarbleDiagramComponent implements OnInit {
  @Input()
  values: [{ percentage: number, value: any, type: EVENT_TYPE }];
  @Input()
  valueToHighlight;
  @Output()
  valueSelected = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  marbleClicked(value) {
    this.valueSelected.emit(value);
  }

  isValueSelected(value) {
    return value === this.valueToHighlight;
  }

  isNextEvent(type) {
    return EVENT_TYPE.NEXT === type;
  }

  isCompleteEvent(type) {
    return EVENT_TYPE.COMPLETE === type;
  }
}
