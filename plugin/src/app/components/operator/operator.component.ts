import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})
export class OperatorComponent implements OnInit {
  @Input()
  name: string;

  constructor() { }

  ngOnInit() {
  }

}
