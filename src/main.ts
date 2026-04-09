import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app.component';
import { appConfig } from './app/app.config';
import { mockApiInterceptor } from './app/mock/mock-api.interceptor';

const mockConfig = {
  providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
};

bootstrapApplication(App, mergeApplicationConfig(appConfig, mockConfig)).catch(err =>
  console.error(err),
);
