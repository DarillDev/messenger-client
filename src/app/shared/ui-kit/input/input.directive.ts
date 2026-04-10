import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  FORM_FIELD_CONTROL,
  IFormFieldControl,
} from '@app/shared/ui-kit/form-field/tokens/form-field-control.token';
import { FORM_FIELD } from '@app/shared/ui-kit/form-field/tokens/form-field.token';
import { Subject } from 'rxjs';

let nextId = 0;

@Directive({
  selector: 'input[uiKitInput], textarea[uiKitInput]',
  standalone: true,
  providers: [{ provide: FORM_FIELD_CONTROL, useExisting: UiKitInputDirective }],
  host: {
    class: 'ui-kit-input',
    '[class.ui-kit-input-error]': 'isErrorState',
    '[class.ui-kit-input--in-field]': 'isInField',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(input)': 'onInputChange()',
  },
})
export class UiKitInputDirective implements IFormFieldControl, OnInit, OnDestroy {
  public readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly formField = inject(FORM_FIELD, { optional: true });

  public readonly stateChanges = new Subject<void>();

  public isFocused = false;

  public ngOnInit(): void {
    if (!this.elementRef.nativeElement.id) {
      this.elementRef.nativeElement.id = `ui-kit-input-${nextId++}`;
    }

    this.formField?.registerControl(this);
  }

  public get id(): string {
    return this.elementRef.nativeElement.id;
  }

  public get isEmpty(): boolean {
    return !this.elementRef.nativeElement.value;
  }

  public get isDisabled(): boolean {
    return this.elementRef.nativeElement.disabled;
  }

  public get isInField(): boolean {
    return !!this.formField;
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
