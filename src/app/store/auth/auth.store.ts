import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { UserMapper } from '@core/api/controllers/user/mappers/user/user.mapper';
import { ILoginRequest } from '@core/auth/interfaces/login-request.interface';
import { ILoginResponse } from '@core/auth/interfaces/login-response.interface';
import { IRefreshResponse } from '@core/auth/interfaces/refresh-response.interface';
import { JwtToken } from '@core/auth/models/jwt-token';
import { AuthService } from '@core/auth/services/auth/auth.service';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, tap } from 'rxjs';

import { UserStore } from '../user/user.store';

type TAuthState = {
  token: JwtToken | null;
};

const initialState: TAuthState = {
  token: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withDevtools('auth'),
  withState(initialState),
  withComputed(({ token }) => ({
    isAuthenticated: computed(() => {
      const t = token();
      return t !== null && !t.isExpired;
    }),
  })),
  withMethods(store => {
    const authService = inject(AuthService);
    const tokenStorage = inject(TokenStorageService);
    const userStore = inject(UserStore);
    const router = inject(Router);

    return {
      login(params: ILoginRequest): Observable<ILoginResponse> {
        return authService.login(params).pipe(
          tap(response => {
            const jwtToken = JwtToken.decode(response.accessToken, response.refreshToken);

            patchState(store, { token: jwtToken });

            tokenStorage.setTokens(response.accessToken, response.refreshToken);
            userStore.setUser(UserMapper.fromDto(response.user));
          }),
        );
      },

      refreshTokens(): Observable<IRefreshResponse> {
        const currentRefreshToken =
          store.token()?.refreshToken ?? tokenStorage.getRefreshToken() ?? '';

        return authService.refresh(currentRefreshToken).pipe(
          tap(response => {
            const jwtToken = JwtToken.decode(response.accessToken, response.refreshToken);
            patchState(store, { token: jwtToken });
            tokenStorage.setTokens(response.accessToken, response.refreshToken);
          }),
        );
      },

      logout(): void {
        patchState(store, { token: null });
        tokenStorage.removeTokens();
        userStore.clear();

        void router.navigate(['/login']);
      },

      restoreSession(accessToken: string, refreshToken: string): void {
        const jwtToken = JwtToken.decode(accessToken, refreshToken);
        patchState(store, { token: jwtToken });
      },
    };
  }),
);
