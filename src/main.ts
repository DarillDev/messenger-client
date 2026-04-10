import { bootstrapApplication } from '@angular/platform-browser';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';

import { App } from './app/app.component';
import { appConfig } from './app/app.config';
import environment from './environments/environment.json';

bootstrapApplication(App, {
  providers: [{ provide: APPLICATION_ENVIRONMENT, useValue: environment }, ...appConfig.providers],
}).catch(error => console.error(error));
