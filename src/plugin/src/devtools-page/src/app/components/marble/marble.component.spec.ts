import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarbleComponent } from './marble.component';

describe('MarbleComponent', () => {
  let component: MarbleComponent;
  let fixture: ComponentFixture<MarbleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarbleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
