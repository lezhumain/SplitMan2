import { TestBed } from '@angular/core/testing';

import { TestEndpointService } from './test-endpoint.service';
import {UserServiceService} from "./user-service.service";
import {HttpClient} from "@angular/common/http";
import {ApiService} from "./api.service";

describe('TestEndpointService', () => {
  let service: TestEndpointService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new TestEndpointService(httpClientSpy, new ApiService(httpClientSpy));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
