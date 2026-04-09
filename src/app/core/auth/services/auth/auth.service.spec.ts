import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { ILoginResponse } from '../../interfaces/login-response.interface';
import { IRefreshResponse } from '../../interfaces/refresh-response.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('login', () => {
    it('should send POST to /api/auth/login with credentials', () => {
      const mockResponse: ILoginResponse = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: { userId: 'u1', userName: 'Stepan', isOnline: true },
      };

      service.login({ userName: 'Stepan', password: 'pass123' }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const request = httpTesting.expectOne('/api/auth/login');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ userName: 'Stepan', password: 'pass123' });

      request.flush(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should send POST to /api/auth/refresh with refreshToken', () => {
      const mockResponse: IRefreshResponse = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      };

      service.refresh('old-refresh').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const request = httpTesting.expectOne('/api/auth/refresh');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ refreshToken: 'old-refresh' });

      request.flush(mockResponse);
    });
  });
});
