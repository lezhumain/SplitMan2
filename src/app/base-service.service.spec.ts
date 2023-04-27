import { TestBed } from '@angular/core/testing';

import { UserServiceService } from './user-service.service';
import {getBaseTestStuff, getBaseTestStuffService} from "../../e2e/baseTestStuff";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BaseService} from "./base-service.service";
import {ActivatedRoute} from "@angular/router";
import {Observable, of} from "rxjs";

describe('BaseServiceService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let baseService: BaseService;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    baseService = new BaseService(httpClientSpy);
  });

  it('should be created', () => {
    expect(baseService).toBeTruthy();
  });
  //
  // it('should return expected basees (HttpClient called once)', (done: DoneFn) => {
  //   const expectedBasees: any[] =
  //     [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
  //
  //   httpClientSpy.get.and.returnValue(of(expectedBasees));
  //
  //   baseService["httpGet"]("/get").subscribe(
  //     basees => {
  //       expect(basees).toEqual(expectedBasees);
  //       done();
  //     },
  //     done.fail
  //   );
  //   expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  // });
  //
  // // it('should return an error when the server returns a 404', (done: DoneFn) => {
  // //   const errorResponse = new HttpErrorResponse({
  // //     error: 'test 404 error',
  // //     status: 404, statusText: 'Not Found'
  // //   });
  // //
  // //   httpClientSpy.get.and.returnValue(Observable.t asyncError(errorResponse));
  // //
  // //   baseService.getBasees().subscribe(
  // //     basees => done.fail('expected an error, not basees'),
  // //     error  => {
  // //       expect(error.message).toContain('test 404 error');
  // //       done();
  // //     }
  // //   );
  // // });
  //
  //
  //
  // // let service: BaseService;
  // // const fakeHttpClient = {
  // //   get: (data) => {
  // //     return of({});
  // //   }
  // // };
  // //
  // // beforeEach(async () => {
  // //   // await TestBed.configureTestingModule(getBaseTestStuffService()).compileComponents();
  // //
  // //   const conf = getBaseTestStuff([]);
  // //   conf[1].providers.push(
  // //     {provide: HttpClient, useValue: fakeHttpClient},
  // //     BaseService);
  // //   debugger;
  // //
  // //   await TestBed.configureTestingModule(conf).compileComponents();
  // // });
  // //
  // // beforeEach(() => {
  // //   TestBed.configureTestingModule({});
  // //   const c = TestBed.inject(HttpClient);
  // //   debugger;
  // //   service = TestBed.inject(BaseService);
  // //
  // // });
  // //
  // // it('should be created', () => {
  // //   expect(service).toBeTruthy();
  // // });
});
