import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelListComponent } from './travel-list.component';
import {TravelService} from "../travel.service";
import {UserServiceService} from "../user-service.service";
import {NavBarService} from "../nav-bar.service";
import {allRoutes, AppRoutingModule} from "../app-routing/app-routing.module";
import {Travel} from "../models/travel";

import travs from "./data/travels.json";
import user from "./data/user.json";
import {of} from "rxjs";
import {RouterTestingModule} from "@angular/router/testing";
import {TravelCardComponent} from "../travel-card/travel-card.component";

// import { routes } from "./router";


describe('TravelListComponent', () => {
  let component: TravelListComponent;
  let fixture: ComponentFixture<TravelListComponent>;

  const o = travs;

  let fakeTravelService = {
    getTravels: () => {
      return of(travs);
    }
  };
  let fakeUserServiceService = {
    getConnectedUser: () => {
      return of(user);
    }
  };

  // let routes;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelListComponent, TravelCardComponent ],
      providers: [
        {provide: TravelService, useValue: fakeTravelService},
        {provide: UserServiceService, useValue: fakeUserServiceService},
        // {provide: NavBarService, useValue: fakeNavBarService},
        {provide: TravelService, useValue: fakeTravelService}
      ],
      imports: [RouterTestingModule.withRoutes(allRoutes)],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();

    const all = await fakeTravelService.getTravels().toPromise();
    const tot = all.length;
    const allCards = fixture.nativeElement.querySelectorAll("app-travel-card");
    expect(allCards.length).toEqual(tot);

    allCards[0].querySelector(".travel-card").click();

    // // const url = component["router"];
    // const expensestitle = (Array.from(fixture.nativeElement.querySelectorAll("h3")) as HTMLHeadingElement[])
    //   .filter((e: HTMLHeadingElement) => / *Expenses */.test(e.innerText));
    // console.log(expensestitle);
    // debugger;
  });
});
