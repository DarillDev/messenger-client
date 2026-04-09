import { InjectionToken } from '@angular/core';

export interface IApplicationEnvironment {
  apiUrl: string;
}

export const APPLICATION_ENVIRONMENT = new InjectionToken<IApplicationEnvironment>(
  'APPLICATION_ENVIRONMENT',
);
