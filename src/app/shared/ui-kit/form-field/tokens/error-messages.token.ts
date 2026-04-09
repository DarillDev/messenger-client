import { InjectionToken, Optional, Provider, SkipSelf } from '@angular/core';

const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: 'Required field',
  minlength: 'Too short',
  maxlength: 'Too long',
  email: 'Invalid email',
};

export const UI_KIT_ERROR_MESSAGES = new InjectionToken<Record<string, string>>(
  'UI_KIT_ERROR_MESSAGES',
  {
    factory: () => DEFAULT_ERROR_MESSAGES,
  },
);

export function provideUiKitErrorMessages(patch: Record<string, string>): Provider {
  return {
    provide: UI_KIT_ERROR_MESSAGES,
    useFactory: (parent: Record<string, string> | null): Record<string, string> => ({
      ...(parent ?? DEFAULT_ERROR_MESSAGES),
      ...patch,
    }),
    deps: [[new Optional(), new SkipSelf(), UI_KIT_ERROR_MESSAGES]],
  };
}
