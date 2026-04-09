import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@state/auth/auth.store';

import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  it('should allow access when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to / when authenticated', () => {
    const payload = { userId: 'u1', userName: 'User', exp: Math.floor(Date.now() / 1000) + 3600 };
    store.restoreSession(`h.${btoa(JSON.stringify(payload))}.s`, 'refresh-token');
    const navigateSpy = jest.spyOn(router, 'navigate');

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
