import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteComponent } from './invite.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {ActivatedRoute} from "@angular/router";
import {ExpenseEditComponent} from "../expense-edit/expense-edit.component";
import {TravelCardComponent} from "../travel-card/travel-card.component";

describe('InviteComponent', () => {
  let component: InviteComponent;
  let fixture: ComponentFixture<InviteComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ InviteComponent ], {travelID: 1, expenseID: 1, userID: 1});
    fakeActivatedRoute = baseStuff[0];

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
