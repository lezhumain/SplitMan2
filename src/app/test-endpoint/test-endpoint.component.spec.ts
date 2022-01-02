import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEndpointComponent } from './test-endpoint.component';

describe('TestEndpointComponent', () => {
  let component: TestEndpointComponent;
  let fixture: ComponentFixture<TestEndpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestEndpointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
