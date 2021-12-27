import { TestBed } from '@angular/core/testing';

import { UserServiceService } from './user-service.service';
import {getBaseTestStuff, getBaseTestStuffService} from "../../e2e/baseTestStuff";
import {BaseService} from "./base-service.service";
import {HttpClient} from "@angular/common/http";


describe('UserServiceService', () => {
  let service: UserServiceService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new UserServiceService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
