import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TimeoutError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        void router.navigate(['/error']);
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse && error.status >= 500) {
        void router.navigate(['/error']);
      }

      return throwError(() => error);
    }),
  );
};
