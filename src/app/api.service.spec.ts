import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import {HttpClient} from "@angular/common/http";
import {of} from "rxjs";

describe('ApiService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let apiService: ApiService;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    apiService = new ApiService(httpClientSpy);
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('should return expected basees (HttpClient called once)', (done: DoneFn) => {
    const expectedBasees: any[] =
      [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];

    httpClientSpy.get.and.returnValue(of(expectedBasees));

    apiService["httpGet"]("/get").subscribe(
      basees => {
        expect(basees).toEqual(expectedBasees);
        done();
      },
      done.fail
    );
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  // it('should return an error when the server returns a 404', (done: DoneFn) => {
  //   const errorResponse = new HttpErrorResponse({
  //     error: 'test 404 error',
  //     status: 404, statusText: 'Not Found'
  //   });
  //
  //   httpClientSpy.get.and.returnValue(Observable.t asyncError(errorResponse));
  //
  //   apiService.getBasees().subscribe(
  //     basees => done.fail('expected an error, not basees'),
  //     error  => {
  //       expect(error.message).toContain('test 404 error');
  //       done();
  //     }
  //   );
  // });



  // let service: ApiService;
  // const fakeHttpClient = {
  //   get: (data) => {
  //     return of({});
  //   }
  // };
  //
  // beforeEach(async () => {
  //   // await TestBed.configureTestingModule(getBaseTestStuffService()).compileComponents();
  //
  //   const conf = getBaseTestStuff([]);
  //   conf[1].providers.push(
  //     {provide: HttpClient, useValue: fakeHttpClient},
  //     ApiService);
  //   debugger;
  //
  //   await TestBed.configureTestingModule(conf).compileComponents();
  // });
  //
  // beforeEach(() => {
  //   TestBed.configureTestingModule({});
  //   const c = TestBed.inject(HttpClient);
  //   debugger;
  //   service = TestBed.inject(ApiService);
  //
  // });
  //
  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});
