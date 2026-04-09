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
});
