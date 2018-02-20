import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleMapComponent } from './example-map.component';

describe('ExampleMapComponent', () => {
  let component: ExampleMapComponent;
  let fixture: ComponentFixture<ExampleMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExampleMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
