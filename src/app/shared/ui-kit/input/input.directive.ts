import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  FORM_FIELD_CONTROL,
  IFormFieldControl,
} from '@shared/ui-kit/form-field/form-field-control.token';
import { FORM_FIELD } from '@shared/ui-kit/form-field/form-field.token';
import { Subject } from 'rxjs';

let nextId = 0;

@Directive({
  selector: 'input[uiKitInput], textarea[uiKitInput]',
  standalone: true,
  providers: [{ provide: FORM_FIELD_CONTROL, useExisting: UiKitInputDirective }],
  host: {
    class: 'ui-kit-input',
    '[id]': 'id',
    '[class.ui-kit-input-error]': 'isErrorState',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(input)': 'onInputChange()',
  },
})
export class UiKitInputDirective implements IFormFieldControl, OnDestroy {
  public readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly formField = inject(FORM_FIELD, { optional: true });

  public readonly stateChanges = new Subject<void>();
  public readonly id = `ui-kit-input-${nextId++}`;

  public isFocused = false;

  constructor() {
    this.formField?.registerControl(this);
  }

  public get isEmpty(): boolean {
    return !this.elementRef.nativeElement.value;
  }

  public get isDisabled(): boolean {
    return this.elementRef.nativeElement.disabled;
  }

  public get isErrorState(): boolean {
    const control = this.ngControl;
    return !!(control?.invalid && control?.touched);
  }

  public get placeholder(): string {
    return this.elementRef.nativeElement.placeholder;
  }

  public onFocus(): void {
    this.isFocused = true;
    this.stateChanges.next();
  }

  public onBlur(): void {
    this.isFocused = false;
    this.stateChanges.next();
  }

  public onInputChange(): void {
    this.stateChanges.next();
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
  }
}
