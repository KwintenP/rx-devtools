import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarblesOverviewComponent } from './marbles-overview.component';

describe('MarblesOverviewComponent', () => {
  let component: MarblesOverviewComponent;
  let fixture: ComponentFixture<MarblesOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarblesOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarblesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
