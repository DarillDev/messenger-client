import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@state/auth/auth.store';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let store: InstanceType<typeof AuthStore>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideRouter([
          { path: 'login', component: class {} as never },
          { path: '', component: class {} as never },
        ]),
      ],
    });

    store = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow access when authenticated', () => {
    const payload = { userId: 'u1', userName: 'Stepan', exp: Math.floor(Date.now() / 1000) + 3600 };
    store.restoreSession(`h.${btoa(JSON.stringify(payload))}.s`, 'refresh-token');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
