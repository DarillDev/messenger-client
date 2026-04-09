import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { throwError, of } from 'rxjs';
import { TimeoutError } from 'rxjs';

import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should navigate to /error on TimeoutError', fakeAsync(() => {
    const mockHandler = { handle: () => throwError(() => new TimeoutError()) };
    const mockRequest = {} as Parameters<typeof httpErrorInterceptor>[0];

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(mockRequest, mockHandler.handle as Parameters<typeof httpErrorInterceptor>[1]).subscribe({
        error: () => {},
      });
    });

    expect(router.navigate).toHaveBeenCalledWith(['/error']);
  }));

  it('should navigate to /error on 500 error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 500 });
    const mockHandler = { handle: () => throwError(() => error) };
    const mockRequest = {} as Parameters<typeof httpErrorInterceptor>[0];

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(mockRequest, mockHandler.handle as Parameters<typeof httpErrorInterceptor>[1]).subscribe({
        error: () => {},
      });
    });

    expect(router.navigate).toHaveBeenCalledWith(['/error']);
  }));

  it('should NOT navigate to /error on 404 error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 404 });
    const mockHandler = { handle: () => throwError(() => error) };
    const mockRequest = {} as Parameters<typeof httpErrorInterceptor>[0];

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(mockRequest, mockHandler.handle as Parameters<typeof httpErrorInterceptor>[1]).subscribe({
        error: () => {},
      });
    });

    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should pass through successful responses', fakeAsync(() => {
    const mockHandler = { handle: () => of({ type: 4, body: {} }) };
    const mockRequest = {} as Parameters<typeof httpErrorInterceptor>[0];
    let result: unknown;

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(mockRequest, mockHandler.handle as Parameters<typeof httpErrorInterceptor>[1]).subscribe({
        next: value => {
          result = value;
        },
      });
    });

    expect(result).toBeDefined();
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
