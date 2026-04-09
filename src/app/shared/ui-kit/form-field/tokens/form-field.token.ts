import { InjectionToken } from '@angular/core';

import { IFormFieldControl } from './form-field-control.token';

export interface IFormField {
  registerControl(control: IFormFieldControl): void;
}

export const FORM_FIELD = new InjectionToken<IFormField>('FORM_FIELD');
