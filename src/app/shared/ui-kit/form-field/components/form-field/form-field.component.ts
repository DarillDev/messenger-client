import {
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { ErrorTextPipe } from '../../../cdk/error-text/error-text.pipe';
import { UiKitPrefixDirective } from '../../directives/prefix/prefix.directive';
import { UiKitSuffixDirective } from '../../directives/suffix/suffix.directive';
import { FORM_FIELD } from '../../tokens/form-field.token';

import type { IFormFieldControl } from '../../tokens/form-field-control.token';
import type { IFormField } from '../../tokens/form-field.token';

@Component({
  selector: 'ui-kit-form-field',
  imports: [ErrorTextPipe],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  providers: [{ provide: FORM_FIELD, useExisting: FormFieldComponent }],
})
export class FormFieldComponent implements IFormField {
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly label = input('');
  public readonly hint = input('');
  public readonly isFloatingLabel = input(false);
  public readonly errorMessages = input<Record<string, string>>({});

  protected readonly control = signal<IFormFieldControl | null>(null);
  protected readonly hasPrefix = contentChild(UiKitPrefixDirective);
  protected readonly hasSuffix = contentChild(UiKitSuffixDirective);

  protected readonly controlId = computed(() => this.control()?.id ?? '');

  constructor() {
    effect(onCleanup => {
      const control = this.control();

      if (!control) {
        return;
      }

      const subscription = control.stateChanges.subscribe(() => this.cdr.markForCheck());

      onCleanup(() => subscription.unsubscribe());
    });
  }

  public registerControl(control: IFormFieldControl): void {
    this.control.set(control);
  }
}
