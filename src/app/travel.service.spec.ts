import { TestBed } from '@angular/core/testing';

import { TravelService } from './travel.service';
import {HttpClient} from "@angular/common/http";
import {UserServiceService} from "./user-service.service";
import {of} from "rxjs";
import {Travel} from "./models/travel";
import {someTravels} from "../test-data/travels";
import {User} from "./models/user";
import {flatMap} from "rxjs/internal/operators";
import {catchError} from "rxjs/operators";

describe('TravelService', () => {
  let service: TravelService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new TravelService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not return any travels', (doneFn: DoneFn) => {
    expect(service).toBeTruthy();
    const data: any[] = someTravels.slice();

    httpClientSpy.get.and.returnValue(of(data));

    const userObj: any = null;

    // const userClientSpy = jasmine.createSpyObj('UserServiceService', ['getConnectedUser']);
    // userClientSpy.get.and.returnValue(of(userObj);

    const userService = new UserServiceService(httpClientSpy);
    userService["_connectedUser"].next(userObj);
    // userService["getConnectedUser"] = () => {
    //
    // };

    userService.getConnectedUser().pipe(
      flatMap((u) => {
        return service["getTravels"]();
      }),
      catchError(() => of(undefined))
    ).subscribe((received: Travel[] | undefined) => {
      expect(received).toBeTruthy();
      if (received !== undefined) {
        expect(received.length).toEqual(0);
      }
      doneFn();
    });
  });

  it("should return user's travels", (doneFn: DoneFn) => {
    expect(service).toBeTruthy();
    const data: any[] = someTravels.slice();

    httpClientSpy.get.and.returnValue(of(data));

    const userObj: any = {
        type: "user",
        id: 2,
        invites: [{tripID: 0}, {tripID: 1}]
      };

    // const userClientSpy = jasmine.createSpyObj('UserServiceService', ['getConnectedUser']);
    // userClientSpy.get.and.returnValue(of(userObj);

    const userService = new UserServiceService(httpClientSpy);
    userService["_connectedUser"].next(User.fromJson(userObj));
    // userService["getConnectedUser"] = () => {
    //
    // };

    userService.getConnectedUser().pipe(
      flatMap((u) => {
          return service["getTravels"]();
      }),
      catchError(() => of(undefined))
    ).subscribe((received: Travel[] | undefined) => {
      if (received !== undefined) {
        expect(received.length).toEqual(2);
      }
      doneFn();
    });
  });
});
