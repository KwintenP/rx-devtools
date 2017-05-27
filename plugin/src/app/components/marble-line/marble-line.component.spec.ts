import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarbleLineComponent } from './marble-line.component';

describe('MarbleLineComponent', () => {
  let component: MarbleLineComponent;
  let fixture: ComponentFixture<MarbleLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarbleLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarbleLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
