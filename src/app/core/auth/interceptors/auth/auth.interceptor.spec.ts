import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@app/core/store/auth/auth.store';

import { authInterceptor } from './auth.interceptor';

function makeMockJwt(userId = 'u1', userName = 'Stepan', expOffsetSec = 3600): string {
  const payload = {
    userId,
    userName,
    exp: Math.floor(Date.now() / 1000) + expOffsetSec,
  };
  return `mock-header.${btoa(JSON.stringify(payload))}.mock-sig`;
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should add Bearer token to requests when authenticated', () => {
    const accessToken = makeMockJwt();
    store.restoreSession(accessToken, 'refresh-456');

    http.get('/api/users').subscribe();

    const request = httpTesting.expectOne('/api/users');

    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${accessToken}`);

    request.flush({});
  });

  it('should not add token when not authenticated', () => {
    http.get('/api/users').subscribe();

    const request = httpTesting.expectOne('/api/users');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('should skip auth endpoints', () => {
    const accessToken = makeMockJwt();
    store.restoreSession(accessToken, 'refresh-456');

    http.post('/api/auth/login', {}).subscribe();

    const request = httpTesting.expectOne('/api/auth/login');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('should pass through non-403 errors', () => {
    const accessToken = makeMockJwt();
    store.restoreSession(accessToken, 'refresh-456');
    let errorStatus = 0;

    http.get('/api/users').subscribe({
      error: (error: HttpErrorResponse) => {
        errorStatus = error.status;
      },
    });

    const request = httpTesting.expectOne('/api/users');
    request.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorStatus).toBe(404);
  });

  it('should retry request with new token after successful refresh on 403', () => {
    const oldAccess = makeMockJwt();
    const newAccess = makeMockJwt('u1', 'Stepan', 7200);
    store.restoreSession(oldAccess, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');
    let responseData: unknown = null;

    http.get('/api/users').subscribe(data => {
      responseData = data;
    });

    httpTesting
      .expectOne('/api/users')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    httpTesting
      .expectOne('/api/auth/refresh')
      .flush({ accessToken: newAccess, refreshToken: 'new-refresh' });

    const retryRequest = httpTesting.expectOne('/api/users');

    expect(retryRequest.request.headers.get('Authorization')).toBe(`Bearer ${newAccess}`);

    retryRequest.flush({ data: 'success' });

    expect(responseData).toEqual({ data: 'success' });
  });

  it('should logout and propagate error when refresh fails on 403', () => {
    const accessToken = makeMockJwt();
    store.restoreSession(accessToken, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');
    const logoutSpy = jest.spyOn(store, 'logout');
    let caughtError: HttpErrorResponse | null = null;

    http.get('/api/users').subscribe({
      error: (error: HttpErrorResponse) => {
        caughtError = error;
      },
    });

    httpTesting
      .expectOne('/api/users')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    httpTesting
      .expectOne('/api/auth/refresh')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(caughtError!.status).toBe(403);
  });

  it('should start a new refresh when 403 occurs after a previous refresh has completed', () => {
    const oldAccess = makeMockJwt();
    const newAccess = makeMockJwt('u1', 'Stepan', 7200);
    const newerAccess = makeMockJwt('u1', 'Stepan', 10800);
    store.restoreSession(oldAccess, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');

    http.get('/api/chats').subscribe();
    httpTesting
      .expectOne('/api/chats')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    httpTesting
      .expectOne('/api/auth/refresh')
      .flush({ accessToken: newAccess, refreshToken: 'new-refresh' });
    httpTesting.expectOne('/api/chats').flush([]);

    http.get('/api/messages').subscribe();
    httpTesting
      .expectOne('/api/messages')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    const secondRefreshRequests = httpTesting.match('/api/auth/refresh');

    expect(secondRefreshRequests.length).toBe(1);

    secondRefreshRequests[0].flush({ accessToken: newerAccess, refreshToken: 'newer-refresh' });
    httpTesting.expectOne('/api/messages').flush([]);
  });

  it('should send only one refresh request when multiple requests get 403 simultaneously', () => {
    const oldAccess = makeMockJwt();
    const newAccess = makeMockJwt('u1', 'Stepan', 7200);
    store.restoreSession(oldAccess, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');

    http.get('/api/chats').subscribe();
    http.get('/api/messages').subscribe();

    httpTesting
      .expectOne('/api/chats')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    httpTesting
      .expectOne('/api/messages')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    const refreshRequests = httpTesting.match('/api/auth/refresh');

    expect(refreshRequests.length).toBe(1);

    refreshRequests[0].flush({ accessToken: newAccess, refreshToken: 'new-refresh' });

    httpTesting.expectOne('/api/chats').flush([]);
    httpTesting.expectOne('/api/messages').flush([]);
  });

  it('should retry all parallel requests with new token after single refresh', () => {
    const oldAccess = makeMockJwt();
    const newAccess = makeMockJwt('u1', 'Stepan', 7200);
    store.restoreSession(oldAccess, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');
    let chatsData: unknown = null;
    let messagesData: unknown = null;

    http.get('/api/chats').subscribe(data => {
      chatsData = data;
    });
    http.get('/api/messages').subscribe(data => {
      messagesData = data;
    });

    httpTesting
      .expectOne('/api/chats')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    httpTesting
      .expectOne('/api/messages')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    httpTesting
      .expectOne('/api/auth/refresh')
      .flush({ accessToken: newAccess, refreshToken: 'new-refresh' });

    const chatsRetry = httpTesting.expectOne('/api/chats');
    const messagesRetry = httpTesting.expectOne('/api/messages');

    expect(chatsRetry.request.headers.get('Authorization')).toBe(`Bearer ${newAccess}`);
    expect(messagesRetry.request.headers.get('Authorization')).toBe(`Bearer ${newAccess}`);

    chatsRetry.flush({ items: [] });
    messagesRetry.flush({ items: [] });

    expect(chatsData).toEqual({ items: [] });
    expect(messagesData).toEqual({ items: [] });
  });

  it('should call logout exactly once and fail all requests when refresh fails with parallel 403s', () => {
    const oldAccess = makeMockJwt();
    store.restoreSession(oldAccess, 'old-refresh');
    localStorage.setItem('refresh_token', 'old-refresh');
    const logoutSpy = jest.spyOn(store, 'logout');
    let chatsError: HttpErrorResponse | null = null;
    let messagesError: HttpErrorResponse | null = null;

    http.get('/api/chats').subscribe({
      error: (error: HttpErrorResponse) => {
        chatsError = error;
      },
    });
    http.get('/api/messages').subscribe({
      error: (error: HttpErrorResponse) => {
        messagesError = error;
      },
    });

    httpTesting
      .expectOne('/api/chats')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    httpTesting
      .expectOne('/api/messages')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    httpTesting
      .expectOne('/api/auth/refresh')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalledTimes(1);

    expect(chatsError!.status).toBe(403);
    expect(messagesError!.status).toBe(403);
  });
});
