import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type TTheme = 'dark' | 'light';
type TLanguage = 'ru' | 'en';

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
);
