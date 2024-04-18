import { TestBed } from '@angular/core/testing';

import { IpInfoService } from './ip-info.service';

describe('IpInfoService', () => {
  let service: IpInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
