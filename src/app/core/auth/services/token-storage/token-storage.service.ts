import { inject, Injectable } from '@angular/core';

import { AUTH_CONFIG } from '../../tokens/auth-config.token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly config = inject(AUTH_CONFIG);

  public getAccessToken(): string | null {
    return localStorage.getItem(this.config.storageKeys.accessToken);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.config.storageKeys.refreshToken);
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.config.storageKeys.accessToken, accessToken);
    localStorage.setItem(this.config.storageKeys.refreshToken, refreshToken);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.config.storageKeys.accessToken);
    localStorage.removeItem(this.config.storageKeys.refreshToken);
  }
}
