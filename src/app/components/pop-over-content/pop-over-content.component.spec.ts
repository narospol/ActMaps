import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopOverContentComponent } from './pop-over-content.component';

describe('PopOverContentComponent', () => {
  let component: PopOverContentComponent;
  let fixture: ComponentFixture<PopOverContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopOverContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopOverContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
