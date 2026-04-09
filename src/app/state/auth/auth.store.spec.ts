import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';

import { AuthStore } from './auth.store';
import { UserStore } from '../user/user.store';

function makeMockJwt(
  userId = 'u1',
  userName = 'Stepan',
  expOffsetSec = 3600,
): string {
  const payload = {
    userId,
    userName,
    exp: Math.floor(Date.now() / 1000) + expOffsetSec,
  };
  return `mock-header.${btoa(JSON.stringify(payload))}.mock-sig`;
}

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let userStore: InstanceType<typeof UserStore>;
  let tokenStorage: TokenStorageService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    store = TestBed.inject(AuthStore);
    userStore = TestBed.inject(UserStore);
    tokenStorage = TestBed.inject(TokenStorageService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have null token by default', () => {
      expect(store.token()).toBeNull();
    });

    it('should not be authenticated by default', () => {
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should store token and user on successful login', () => {
      const accessToken = makeMockJwt();
      const refreshToken = 'refresh-456';
      const mockResponse = {
        accessToken,
        refreshToken,
        user: { userId: 'u1', userName: 'Stepan', isOnline: true },
      };

      store.login({ userName: 'Stepan', password: 'pass123' }).subscribe();

      const request = httpTesting.expectOne('/api/auth/login');
      request.flush(mockResponse);

      expect(store.token()?.accessToken).toBe(accessToken);
      expect(store.token()?.refreshToken).toBe(refreshToken);
      expect(store.isAuthenticated()).toBe(true);
      expect(userStore.currentUser()).toEqual(mockResponse.user);
      expect(tokenStorage.getAccessToken()).toBe(accessToken);
      expect(tokenStorage.getRefreshToken()).toBe(refreshToken);
    });
  });

  describe('refreshTokens', () => {
    it('should update token on successful refresh', () => {
      const oldAccess = makeMockJwt();
      const newAccess = makeMockJwt('u1', 'Stepan', 7200);
      tokenStorage.setTokens(oldAccess, 'old-refresh');
      store.restoreSession(oldAccess, 'old-refresh');

      store.refreshTokens().subscribe();

      const request = httpTesting.expectOne('/api/auth/refresh');

      expect(request.request.body).toEqual({ refreshToken: 'old-refresh' });

      request.flush({ accessToken: newAccess, refreshToken: 'new-refresh' });

      expect(store.token()?.accessToken).toBe(newAccess);
      expect(store.token()?.refreshToken).toBe('new-refresh');
      expect(tokenStorage.getAccessToken()).toBe(newAccess);
    });
  });

  describe('logout', () => {
    it('should clear token and user', () => {
      const accessToken = makeMockJwt();
      tokenStorage.setTokens(accessToken, 'refresh');
      store.restoreSession(accessToken, 'refresh');
      userStore.setUser({ userId: 'u1', userName: 'Stepan', isOnline: true });

      store.logout();

      expect(store.token()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      expect(userStore.currentUser()).toBeNull();
      expect(tokenStorage.getAccessToken()).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('should decode and store token', () => {
      const accessToken = makeMockJwt();

      store.restoreSession(accessToken, 'refresh-restored');

      expect(store.token()?.accessToken).toBe(accessToken);
      expect(store.token()?.refreshToken).toBe('refresh-restored');
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should not authenticate when token is expired', () => {
      const expiredToken = makeMockJwt('u1', 'Stepan', -100);

      store.restoreSession(expiredToken, 'refresh');

      expect(store.isAuthenticated()).toBe(false);
    });
  });
});
