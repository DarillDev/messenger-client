import { InjectionToken } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';

export interface IFormFieldControl {
  readonly stateChanges: Observable<void>;
  readonly isFocused: boolean;
  readonly isEmpty: boolean;
  readonly isDisabled: boolean;
  readonly isErrorState: boolean;
  readonly ngControl: NgControl | null;
  readonly id: string;
  readonly placeholder: string;
}

export const FORM_FIELD_CONTROL = new InjectionToken<IFormFieldControl>('FORM_FIELD_CONTROL');
