import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCardComponent } from './expense-card.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";

describe('ExpenseCardComponent', () => {
  let component: ExpenseCardComponent;
  let fixture: ComponentFixture<ExpenseCardComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ ExpenseCardComponent ]);
    fakeActivatedRoute = baseStuff[0];
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
