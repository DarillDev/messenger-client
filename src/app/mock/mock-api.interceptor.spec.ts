import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should return mock response for GET /api/mock-test', done => {
    http.get<{ status: string; message: string }>('/api/mock-test').subscribe(res => {
      expect(res.status).toBe('ok');
      expect(res.message).toBe('Mock API works');
      done();
    });
  });

  it('should pass through unknown routes', () => {
    http.get('/api/unknown').subscribe();

    const req = httpTesting.expectOne('/api/unknown');

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  afterEach(() => {
    httpTesting.verify();
  });
});
