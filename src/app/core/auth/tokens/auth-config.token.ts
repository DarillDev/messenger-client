import { InjectionToken } from '@angular/core';

export interface IAuthConfig {
  authUrl: string;
  storageKeys: {
    accessToken: string;
    refreshToken: string;
  };
}

export const AUTH_CONFIG = new InjectionToken<IAuthConfig>('AUTH_CONFIG', {
  factory: (): IAuthConfig => ({
    authUrl: '/api/auth',
    storageKeys: {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    },
  }),
});
