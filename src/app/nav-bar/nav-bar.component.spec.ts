import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent } from './nav-bar.component';
import {UserServiceService} from "../user-service.service";
import {BehaviorSubject} from "rxjs";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {filter, first} from "rxjs/operators";
// import {expect} from "chai";

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  let userService: any, navService: any;

  // const eventRouting$ = new BehaviorSubject(new NavigationStart(0, "register"));
  const eventRouting$: BehaviorSubject<NavigationStart | null> = new BehaviorSubject<NavigationStart | null>(null);
  let fakeRouter: any = {events: eventRouting$, url: ""};
  // const fakeRouter = jasmine.createSpyObj('Router', ['getConnectedUser']);

  // let fakeRouter: any = {events: of(new NavigationStart(0, "register"))};

  let behavUser: BehaviorSubject<any> = new BehaviorSubject(null);

  const fakeUserServ = jasmine.createSpyObj('UserServiceService', ['getConnectedUser']);

  beforeEach(async () => {
    // await TestBed.configureTestingModule({
    //   declarations: [ NavBarComponent ],
    //   providers: [
    //     {provide: UserServiceService},
    //     {provide: NavBarService},
    //     {provide: Router, useValue: fakeRouter}
    //   ],
    //   imports: [RouterTestingModule.withRoutes(allRoutes), HttpClientModule],
    // })
    // .compileComponents();

    const baseStuff = getBaseTestStuff([ NavBarComponent ]);
    if(!baseStuff[1].providers) {
      baseStuff[1].providers = [];
    }
    baseStuff[1].providers.push(
      {provide: UserServiceService, useValue: fakeUserServ},
      {provide: Router, useValue: fakeRouter}
    );
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;

    // userService = component["userServiceService"];
    // navService = component["_navService"];
    //
    // userService["getConnectedUser"] = () => {
    //   return behavUser;
    // };

    // behavUser.next({id: 1, invites: []});

    if(behavUser.getValue() !== null) {
      behavUser.next(null);
    }
    else {
      fakeUserServ.getConnectedUser.and.returnValue(behavUser);
    }
    // fakeUserServ.getConnectedUser.and.returnValue(of(null));

    fixture.detectChanges();
  });

  it('should show angular logo', (doneFn: DoneFn) => {
    expect(component).toBeTruthy();

    const banner: HTMLDivElement = fixture.nativeElement.querySelector(".toolbar");
    expect(banner).toBeTruthy();

    expect(component.showLogo).toBeFalse();
    expect(component["connectedUserID"]).toEqual(null);

    eventRouting$.next(new NavigationStart(0, "register"));

    behavUser.next({id: 1, invites: []});
    // fakeUserServ.getConnectedUser.and.returnValue(of({id: 1, invites: []}));
    // fixture.detectChanges();

    component.connectedUser$?.pipe(
      filter(e => !!e),
      first()
    ).subscribe(() => {
      expect(component.showLogo).toBeTrue();
      expect(component["connectedUserID"]).toBeTruthy();

      const title = banner.querySelector("span");
      expect(title).toBeTruthy();
      expect(title?.innerText).toEqual("Welcome");

      expect(component.showLogo).toBeTrue();

      // FIXME img doesn't appear
      // const img = banner.querySelector("img");
      // expect(img).toBeTruthy();

      doneFn();
    });
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
