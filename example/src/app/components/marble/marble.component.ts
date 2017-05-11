import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-marble',
  templateUrl: './marble.component.html',
  styleUrls: ['./marble.component.css']
})
export class MarbleComponent implements OnInit {
  @Input()
  left;
  @Input()
  value;
  @Input()
  index;
  @Output()
  valueSelected = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  valueSelectedEvent() {
    this.valueSelected.emit(this.value);
  }
}
