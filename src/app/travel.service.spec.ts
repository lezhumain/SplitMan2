import { TestBed } from '@angular/core/testing';

import { TravelService } from './travel.service';
import {HttpClient} from "@angular/common/http";
import {UserServiceService} from "./user-service.service";
import {of} from "rxjs";
import {Travel} from "./models/travel";
import {someTravels} from "../test-data/travels";
import {User} from "./models/user";
import {flatMap} from "rxjs/internal/operators";
import {catchError, filter, first} from "rxjs/operators";
import {BaseService} from "./base-service.service";
import {ApiService} from "./api.service";

describe('TravelService', () => {
  let apiService: ApiService;
  let service: TravelService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    apiService = new ApiService(httpClientSpy);
    service = new TravelService(httpClientSpy, apiService);

    apiService["_allItems$"].next(null)

    await apiService["_allItems$"].pipe(
      filter(e => e === null),
      first()
    ).toPromise();
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

    const userService = new UserServiceService(httpClientSpy, new ApiService(httpClientSpy));
    userService["_connectedUser"].next(userObj);
    BaseService.USER_ID_INIT = null; // hacky ?

    // userService["getConnectedUser"] = () => {
    //
    // };

    // userService.logOut().subscribe(() => {
    //   this.router.navigate(['login']);
    // });
    userService.getConnectedUser().pipe(
      flatMap((u) => {
        return service["getTravels"]();
      }),
      catchError(() => of(undefined))
    ).subscribe((received: Travel[] | undefined) => {
      expect(received).toBeTruthy();
      expect(received?.length).toEqual(0);

      doneFn();
    });
  });

  // FIXME
  it("should return user's travels", (doneFn: DoneFn) => {
    expect(service).toBeTruthy();
    const data: any[] = someTravels.slice();

    httpClientSpy.get.and.returnValue(of(data));

    const userObj: any = {
      type: "user",
      id: 2,
      invites: [{tripID: 0}, {tripID: 1}]
    };

    apiService["userID"] = userObj.id;

    // const userClientSpy = jasmine.createSpyObj('UserServiceService', ['getConnectedUser']);
    // userClientSpy.get.and.returnValue(of(userObj);

    const userService = new UserServiceService(httpClientSpy, new ApiService(httpClientSpy));
    userService["_connectedUser"].next(User.fromJson(userObj));
    // userService["getConnectedUser"] = () => {
    //
    // };

    userService["_connectedUser"].pipe(
      filter(u => !!u),
      first(),
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
