import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseComponent } from './expense.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ ExpenseComponent ], {travelID: 1, expenseID: 4});
    fakeActivatedRoute = baseStuff[0];
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
