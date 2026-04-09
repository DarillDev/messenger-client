import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { JwtToken } from '@core/auth/models/jwt-token';
import { AppStore } from '@state/app/app.store';
import { AuthStore } from '@state/auth/auth.store';
import { UserStore } from '@state/user/user.store';

import { AuthService } from '../../services/auth/auth.service';
import { TokenStorageService } from '../../services/token-storage/token-storage.service';
import { AUTH_CONFIG, IAuthConfig } from '../../tokens/auth-config.token';

const defaults: IAuthConfig = {
  authUrl: '/api/auth',
  storageKeys: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  },
};

export function provideAuth(config?: Partial<IAuthConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: AUTH_CONFIG,
      useValue: {
        ...defaults,
        ...config,
        storageKeys: { ...defaults.storageKeys, ...config?.storageKeys },
      },
    },
    provideAppInitializer(() => {
      const tokenStorage = inject(TokenStorageService);
      const authStore = inject(AuthStore);
      const userStore = inject(UserStore);
      const appStore = inject(AppStore);
      const authService = inject(AuthService);

      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        appStore.setInitialized();

        return;
      }

      const jwtToken = JwtToken.decode(accessToken, refreshToken);

      if (!jwtToken) {
        tokenStorage.removeTokens();
        appStore.setInitialized();
        
        return;
      }

      if (!jwtToken.isExpired) {
        authStore.restoreSession(accessToken, refreshToken);
        userStore.setUser({
          userId: jwtToken.payload.userId,
          userName: jwtToken.payload.userName,
          isOnline: true,
        });
        appStore.setInitialized();
        
        return;
      }

      return new Promise<void>(resolve => {
        authService.refresh(refreshToken).subscribe({
          next: response => {
            tokenStorage.setTokens(response.accessToken, response.refreshToken);
            authStore.restoreSession(response.accessToken, response.refreshToken);

            const newToken = JwtToken.decode(response.accessToken, response.refreshToken);

            if (newToken) {
              userStore.setUser({
                userId: newToken.payload.userId,
                userName: newToken.payload.userName,
                isOnline: true,
              });
            }

            appStore.setInitialized();
            resolve();
          },
          error: () => {
            tokenStorage.removeTokens();
            appStore.setInitialized();

            resolve();
          },
        });
      });
    }),
  ]);
}
