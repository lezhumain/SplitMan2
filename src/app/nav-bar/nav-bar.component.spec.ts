import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent } from './nav-bar.component';
import {RouterTestingModule} from "@angular/router/testing";
import {allRoutes} from "../app-routing/app-routing.module";
import {HttpClientModule} from "@angular/common/http";
import {TravelService} from "../travel.service";
import {UserServiceService} from "../user-service.service";
import {NavBarService} from "../nav-bar.service";
import {BehaviorSubject} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import {BabelAstHost} from "@angular/compiler-cli/linker/babel/src/ast/babel_ast_host";

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  let userService: any, navService: any;
  let fakeRouter: any = {events: new BehaviorSubject(new NavigationEnd(0, "register", "login"))};

  let behavUser: BehaviorSubject<any> = new BehaviorSubject(null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavBarComponent ],
      providers: [
        {provide: UserServiceService},
        {provide: NavBarService},
        {provide: Router, useValue: fakeRouter}
      ],
      imports: [RouterTestingModule.withRoutes(allRoutes), HttpClientModule],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;

    userService = component["userServiceService"];
    navService = component["_navService"];

    userService["getConnectedUser"] = () => {
      return behavUser;
    };

    fixture.detectChanges();
  });

  it('should show angular logo', () => {
    expect(component).toBeTruthy();

    const banner: HTMLDivElement = fixture.nativeElement.querySelector(".toolbar");
    expect(banner).toBeTruthy();

    const title = banner.querySelector("span");
    expect(title).toBeTruthy();
    expect(title?.innerText).toEqual("Welcome");

    const img = fixture.nativeElement.querySelector("img[alt=\"Angular Logo\"]");
    expect(img).toBeTruthy();
  });

  it('should show notif', () => {
    expect(component).toBeTruthy();

    fakeRouter.events.next(new NavigationEnd(0, "travels", "travels"));
    behavUser.next({id: 1, invites: [{isAccepted: false}]});

    fixture.detectChanges();

    const notif = fixture.nativeElement.querySelector("i.notif");
    expect(notif).toBeTruthy();
  });

  it('should not show notif', () => {
    expect(component).toBeTruthy();

    fakeRouter.events.next(new NavigationEnd(0, "travels", "travels"));
    behavUser.next({id: 1, invites: [{isAccepted: true}]});

    fixture.detectChanges();

    const notif = fixture.nativeElement.querySelector("i.notif");
    expect(notif).toBeFalsy();
  });
});
