import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppStore } from '@store/app/app.store';
import { AuthStore } from '@store/auth/auth.store';
import { UserStore } from '@store/user/user.store';

import { provideAuth } from './auth.provider';

describe('provideAuth', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('initializer with no token', () => {
    it('should set initialized when no token exists', async () => {
      localStorage.clear();

      await TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideAuth(),
        ],
      }).compileComponents();

      const appStore = TestBed.inject(AppStore);

      expect(appStore.isInitialized()).toBe(true);
    });
  });

  describe('initializer with valid token', () => {
    it('should restore session when valid token exists', async () => {
      const payload = {
        userId: 'u1',
        userName: 'Stepan',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const fakeJwt = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('access_token', fakeJwt);
      localStorage.setItem('refresh_token', 'fake-refresh');

      await TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideAuth(),
        ],
      }).compileComponents();

      const appStore = TestBed.inject(AppStore);
      const authStore = TestBed.inject(AuthStore);
      const userStore = TestBed.inject(UserStore);

      expect(appStore.isInitialized()).toBe(true);
      expect(authStore.isAuthenticated()).toBe(true);
      expect(userStore.userName()).toBe('Stepan');
    });
  });

  describe('initializer with invalid token', () => {
    it('should clear tokens when token is malformed', async () => {
      localStorage.setItem('access_token', 'invalid-token');
      localStorage.setItem('refresh_token', 'fake-refresh');

      await TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideAuth(),
        ],
      }).compileComponents();

      const appStore = TestBed.inject(AppStore);
      const authStore = TestBed.inject(AuthStore);

      expect(appStore.isInitialized()).toBe(true);
      expect(authStore.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('initializer with expired token', () => {
    it('should refresh token when access token is expired', async () => {
      const expiredPayload = {
        userId: 'u1',
        userName: 'Stepan',
        exp: Math.floor(Date.now() / 1000) - 100,
      };
      const expiredJwt = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      localStorage.setItem('access_token', expiredJwt);
      localStorage.setItem('refresh_token', 'old-refresh');

      const initPromise = TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideAuth(),
        ],
      }).compileComponents();

      const httpTesting = TestBed.inject(HttpTestingController);

      const newPayload = {
        userId: 'u1',
        userName: 'Stepan',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const newJwt = `header.${btoa(JSON.stringify(newPayload))}.signature`;

      const refreshReq = httpTesting.expectOne('/api/auth/refresh');

      expect(refreshReq.request.body).toEqual({ refreshToken: 'old-refresh' });

      refreshReq.flush({ accessToken: newJwt, refreshToken: 'new-refresh' });

      await initPromise;

      const appStore = TestBed.inject(AppStore);
      const authStore = TestBed.inject(AuthStore);
      const userStore = TestBed.inject(UserStore);

      expect(appStore.isInitialized()).toBe(true);
      expect(authStore.isAuthenticated()).toBe(true);
      expect(userStore.userName()).toBe('Stepan');

      httpTesting.verify();
    });

    it('should clear tokens when refresh fails for expired token', async () => {
      const expiredPayload = {
        userId: 'u1',
        userName: 'Stepan',
        exp: Math.floor(Date.now() / 1000) - 100,
      };
      const expiredJwt = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      localStorage.setItem('access_token', expiredJwt);
      localStorage.setItem('refresh_token', 'old-refresh');

      const initPromise = TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          provideAuth(),
        ],
      }).compileComponents();

      const httpTesting = TestBed.inject(HttpTestingController);

      const refreshReq = httpTesting.expectOne('/api/auth/refresh');
      refreshReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await initPromise;

      const appStore = TestBed.inject(AppStore);
      const authStore = TestBed.inject(AuthStore);

      expect(appStore.isInitialized()).toBe(true);
      expect(authStore.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();

      httpTesting.verify();
    });
  });
});
