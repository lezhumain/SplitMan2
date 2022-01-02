import { TestBed } from '@angular/core/testing';

import { TestEndpointService } from './test-endpoint.service';

describe('TestEndpointService', () => {
  let service: TestEndpointService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestEndpointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
