import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelEditComponent } from './travel-edit.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";

describe('TravelEditComponent', () => {
  let component: TravelEditComponent;
  let fixture: ComponentFixture<TravelEditComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ TravelEditComponent ], {"travelID": 1});
    fakeActivatedRoute = baseStuff[0];

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
