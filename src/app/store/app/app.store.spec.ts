import { TestBed } from '@angular/core/testing';

import { AppStore } from './app.store';

describe('AppStore', () => {
  let store: InstanceType<typeof AppStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStore],
    });

    store = TestBed.inject(AppStore);
  });

  describe('initial state', () => {
    it('should have dark theme by default', () => {
      expect(store.theme()).toBe('dark');
    });

    it('should have ru language by default', () => {
      expect(store.language()).toBe('ru');
    });

    it('should not be initialized by default', () => {
      expect(store.isInitialized()).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should update theme', () => {
      store.setTheme('light');

      expect(store.theme()).toBe('light');
    });
  });

  describe('setLanguage', () => {
    it('should update language', () => {
      store.setLanguage('en');

      expect(store.language()).toBe('en');
    });
  });

  describe('setInitialized', () => {
    it('should set isInitialized to true', () => {
      store.setInitialized();

      expect(store.isInitialized()).toBe(true);
    });
  });

  describe('Theme persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should apply data-theme attribute to documentElement when theme changes', () => {
      store.setTheme('light');
      TestBed.flushEffects();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should save theme to localStorage when theme changes', () => {
      store.setTheme('light');
      TestBed.flushEffects();

      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should load theme from localStorage on init', () => {
      localStorage.setItem('theme', 'light');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      const store = TestBed.inject(AppStore);

      expect(store.theme()).toBe('light');
    });
  });
});
