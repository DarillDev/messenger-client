import { AbstractControl, ValidatorFn } from '@angular/forms';

export function wrapValidator(validator: ValidatorFn, customKey: string): ValidatorFn {
  return (control: AbstractControl) => {
    const result = validator(control);

    if (!result) {
      return null;
    }

    const originalKey = Object.keys(result)[0];

    return { [customKey]: result[originalKey] };
  };
}
