import { LinkService } from './link.service';
import {ApiService} from "./api.service";
import {HttpClient} from "@angular/common/http";

describe('LinkService', () => {
  let service: LinkService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new LinkService(new ApiService(httpClientSpy));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
