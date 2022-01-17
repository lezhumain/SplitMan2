import { ExpenseService } from './expense.service';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "./api.service";

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new ExpenseService(httpClientSpy, new ApiService(httpClientSpy));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
