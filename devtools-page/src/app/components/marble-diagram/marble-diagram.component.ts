import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-marble-diagram',
  templateUrl: './marble-diagram.component.html',
  styleUrls: ['./marble-diagram.component.css']
})
export class MarbleDiagramComponent implements OnInit {
  @Input()
  values: [{ percentage: number, value: any }];
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
}
