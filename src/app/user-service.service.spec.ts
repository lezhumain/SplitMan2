import { UserServiceService } from './user-service.service';
import {HttpClient} from "@angular/common/http";
import {flatMap} from "rxjs/internal/operators";
import {UserModel} from "./models/user-model";
import {of} from "rxjs";
import {someTravels} from "../test-data/travels";
import {delay, filter, first, tap} from "rxjs/operators";
import {TestBed} from "@angular/core/testing";
import {AppComponent} from "./app.component";
import {BaseService} from "./base-service.service";
import {User} from "./models/user";
import {badData} from "../../e2e/data/bugData";
import {ApiService} from "./api.service";
// import {expect} from "chai";


describe('UserServiceService', () => {
  let service: UserServiceService;
  let apiService: ApiService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async() => {
    // TODO: spy on other methods too
    httpClientSpy = httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    apiService = new ApiService(httpClientSpy);
    service = new UserServiceService(httpClientSpy, apiService);

    apiService["_allItems$"].next(null)

    await apiService["_allItems$"].pipe(
      filter(e => e === null),
      first()
    ).toPromise();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not get connected user', (doneFn: DoneFn) => {
    expect(service).toBeTruthy();

    service["_connectedUser"].next(null);
    service.getConnectedUser().subscribe((cu) => {
      expect(cu).toBeNull();
      doneFn();
    })
  });

  it('should get connected user', (doneFn: DoneFn) => {
    expect(service).toBeTruthy();

    service["_connectedUser"].next(new User());
    service.getConnectedUser().subscribe((cu) => {
      expect(cu).toBeTruthy();
      doneFn();
    })
  });

  it('should call get once', (doneFn: DoneFn) => {
    expect(service).toBeTruthy();

    const data: any[] = someTravels.slice();
    httpClientSpy.get.and.returnValue(of(data));
    httpClientSpy.post.and.returnValue(of({}));

    const userID = 1;
    const us = badData.slice().find(t => t.type === "user" && t.id === userID);

    service["_connectedUser"].next(User.fromJson(us));
    // await service.setConnectedUser("a", "a").toPromise();
    apiService["userID"] = userID;



    service.getConnectedUser().pipe(
      // delay(750),
      flatMap((cu) => {
        expect(cu).toBeTruthy();
        return service.getUserByID(userID);
      }),
      tap((d) => {
        expect(d).toBeTruthy();
        expect(d?.id).toEqual(userID);
        expect(d?.email).toContain("@");
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
      }),
      flatMap(() => {
        return service.getUserByID(userID);
      }),
      tap((d) => {
        expect(d).toBeTruthy();
        expect(d?.id).toEqual(userID);
        expect(d?.email).toContain("@");
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
      })
    ).subscribe(() => {
      doneFn();
    })
  });
});
