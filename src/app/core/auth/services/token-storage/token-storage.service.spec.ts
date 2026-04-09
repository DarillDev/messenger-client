import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAccessToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return stored access token', () => {
      localStorage.setItem('access_token', 'test-token');

      expect(service.getAccessToken()).toBe('test-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return stored refresh token', () => {
      localStorage.setItem('refresh_token', 'test-refresh');

      expect(service.getRefreshToken()).toBe('test-refresh');
    });
  });

  describe('setTokens', () => {
    it('should store both tokens in localStorage', () => {
      service.setTokens('access-123', 'refresh-456');

      expect(localStorage.getItem('access_token')).toBe('access-123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-456');
    });
  });

  describe('removeTokens', () => {
    it('should remove both tokens from localStorage', () => {
      localStorage.setItem('access_token', 'access-123');
      localStorage.setItem('refresh_token', 'refresh-456');

      service.removeTokens();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });
});
