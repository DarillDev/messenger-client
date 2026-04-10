import { effect } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

export type TTheme = 'dark' | 'light';
export type TLanguage = 'ru' | 'en';

type TAppState = {
  theme: TTheme;
  language: TLanguage;
  isInitialized: boolean;
};

const initialState: TAppState = {
  theme: 'dark',
  language: 'ru',
  isInitialized: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withDevtools('app'),
  withState(initialState),
  withMethods(store => ({
    setTheme(theme: TTheme): void {
      patchState(store, { theme });
    },
    setLanguage(language: TLanguage): void {
      patchState(store, { language });
    },
    setInitialized(): void {
      patchState(store, { isInitialized: true });
    },
  })),
  withHooks({
    onInit(store): void {
      const saved = localStorage.getItem('theme');

      if (saved === 'dark' || saved === 'light') {
        patchState(store, { theme: saved });
      }

      effect(() => {
        document.documentElement.setAttribute('data-theme', store.theme());
        localStorage.setItem('theme', store.theme());
      });
    },
  }),
);
