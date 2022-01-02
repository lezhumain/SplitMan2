import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEndpointComponent } from './test-endpoint.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {TravelEditComponent} from "../travel-edit/travel-edit.component";

describe('TestEndpointComponent', () => {
  let component: TestEndpointComponent;
  let fixture: ComponentFixture<TestEndpointComponent>;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ TravelEditComponent ]);
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
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
