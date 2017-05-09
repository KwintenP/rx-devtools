import {Component, Input, OnInit} from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

}
