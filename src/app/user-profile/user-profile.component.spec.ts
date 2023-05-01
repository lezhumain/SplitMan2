import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {LoginComponent} from "../login/login.component";
import {UserModel} from "../models/user-model";

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ UserProfileComponent ], {userlID: 0});
    fakeActivatedRoute = baseStuff[0];
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test IBAN', () => {
    expect(component).toBeTruthy();
    component.user = new UserModel();
    component.user.iban = "BE51 9670 2940 0662";
    expect(component.ibanValid).toBeFalse();
    component.checkIBAN();
    expect(component.ibanValid).toBeTrue();

    component.user.iban = "BE51 9670 2940 0";
    // expect(component.ibanValid).toBeFalse();
    component.checkIBAN();
    expect(component.ibanValid).toBeFalse();

    component.user.iban = "";
    component.checkIBAN();
    expect(component.ibanValid).toBeTrue();
  });
});
