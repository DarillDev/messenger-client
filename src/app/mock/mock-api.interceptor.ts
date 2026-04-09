import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api/mock-test') {
    return of(
      new HttpResponse({
        status: 200,
        body: { status: 'ok', message: 'Mock API works' },
      }),
    ).pipe(delay(200));
  }

  return next(req);
};
