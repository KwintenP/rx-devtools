import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-marble-diagram',
  templateUrl: './marble-diagram.component.html',
  styleUrls: ['./marble-diagram.component.css']
})
export class MarbleDiagramComponent implements OnInit {
  @Input()
  values: [{ percentage: number, value: any }];
  @Output()
  valueSelected = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

}
