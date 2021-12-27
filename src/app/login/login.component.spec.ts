import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {ExpenseCardComponent} from "../expense-card/expense-card.component";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ LoginComponent ]);
    fakeActivatedRoute = baseStuff[0];
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
