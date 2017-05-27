import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarbleDiagramComponent } from './marble-diagram.component';

describe('MarbleDiagramComponent', () => {
  let component: MarbleDiagramComponent;
  let fixture: ComponentFixture<MarbleDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarbleDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarbleDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
