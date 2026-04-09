import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ILoginRequest } from '../../interfaces/login-request.interface';
import { ILoginResponse } from '../../interfaces/login-response.interface';
import { IRefreshResponse } from '../../interfaces/refresh-response.interface';
import { AUTH_CONFIG } from '../../tokens/auth-config.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  public login(params: ILoginRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.config.authUrl}/login`, params);
  }

  public refresh(refreshToken: string): Observable<IRefreshResponse> {
    return this.http.post<IRefreshResponse>(`${this.config.authUrl}/refresh`, { refreshToken });
  }
}
