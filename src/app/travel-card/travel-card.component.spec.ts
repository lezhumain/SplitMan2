import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelCardComponent } from './travel-card.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {RegisterComponent} from "../register/register.component";

describe('TravelCardComponent', () => {
  let component: TravelCardComponent;
  let fixture: ComponentFixture<TravelCardComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ TravelCardComponent ], {"travelID": 1});
    fakeActivatedRoute = baseStuff[0];

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
