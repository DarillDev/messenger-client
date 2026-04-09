import { FormControl, Validators } from '@angular/forms';

import { wrapValidator } from './wrap-validator';

describe('wrapValidator', () => {
  it('should remap error key', () => {
    const validator = wrapValidator(Validators.required, 'usernameRequired');
    const control = new FormControl('');

    const result = validator(control);

    expect(result).toEqual({ usernameRequired: true });
  });

  it('should return null when valid', () => {
    const validator = wrapValidator(Validators.required, 'usernameRequired');
    const control = new FormControl('filled');

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should preserve original error value', () => {
    const validator = wrapValidator(Validators.minLength(3), 'tooShort');
    const control = new FormControl('ab');

    const result = validator(control);

    expect(result).toEqual({ tooShort: { requiredLength: 3, actualLength: 2 } });
  });
});
