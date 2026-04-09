import { ELoginFormErrorKey } from '../enums/login-form-error-key.enum';

export const LOGIN_FORM_ERRORS_TEXT: Record<string, string> = {
  [ELoginFormErrorKey.UsernameRequired]: 'Enter your username',
  [ELoginFormErrorKey.PasswordRequired]: 'Enter your password',
  [ELoginFormErrorKey.ServerError]: 'User not found',
};
