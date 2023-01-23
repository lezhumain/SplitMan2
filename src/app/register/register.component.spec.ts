import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {of} from "rxjs";
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {ToastComponent} from "../toast/toast.component";
import {BaseItem} from "../models/baseItem";


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let fakeActivatedRoute;
  let routerSpy: jasmine.SpyObj<any>;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ RegisterComponent ], {"travelID": 1});
    fakeActivatedRoute = baseStuff[0];

    routerSpy = {navigate: jasmine.createSpy('navigate')};
    baseStuff[1].providers.push({ provide: Router, useValue: routerSpy });
    baseStuff[1].declarations.push(ToastComponent);

    // baseStuff[1].providers.push("ApiService");

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // @ts-ignore
    const service = component["userServiceService"]["_apiService"] as ApiService;
    service["httpPost"] = (...args: any[]) => {
      return of(null);
    };
    service["_allItems$"].next([{} as BaseItem]);
  });

  it('should navigate after register', () => {
    expect(component).toBeTruthy();

    component.user = {email: "test@test.co", id: -2, password: "a", password1: "a", username: "dju", invites: []};
    component.doRegister();

    expect (routerSpy.navigate).toHaveBeenCalledWith(['login']);

    // ToastComponent.toastdata$.pipe(
    //   filter(r => !!r),
    //   first()
    // ).subscribe((res) => {
    //   debugger;
    //   // ToastComponent.toastdata$.
    //
    //   expect (routerSpy.navigate).toHaveBeenCalledWith(['login']);
    // });
  }, 10000);
});
