import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense.service';
import {AppComponent} from "./app.component";
import {getBaseTestStuff} from "../../e2e/baseTestStuff";
import {HttpClient} from "@angular/common/http";
import {TravelService} from "./travel.service";

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new ExpenseService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
