import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartitionCardComponent } from './repartition-card.component';
import {getBaseActivatedTestRoute, getBaseTestStuff} from "../../../e2e/baseTestStuff";

describe('RepartitionCardComponent', () => {
  let component: RepartitionCardComponent;
  let fixture: ComponentFixture<RepartitionCardComponent>;

  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ RepartitionCardComponent ], {"travelID": 1});
    fakeActivatedRoute = baseStuff[0];

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepartitionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
