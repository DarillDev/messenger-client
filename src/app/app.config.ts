import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { httpErrorInterceptor } from '@core/api/interceptors/http-error/http-error.interceptor';
import { authInterceptor } from '@core/auth/interceptors/auth/auth.interceptor';
import { provideAuth } from '@core/auth/providers/auth/auth.provider';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
    provideAuth(),
  ],
};
