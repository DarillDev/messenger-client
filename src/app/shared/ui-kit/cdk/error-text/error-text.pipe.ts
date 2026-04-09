import { inject, Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { UI_KIT_ERROR_MESSAGES } from '../../form-field/tokens/error-messages.token';

@Pipe({
  name: 'errorText',
})
export class ErrorTextPipe implements PipeTransform {
  private readonly messages = inject(UI_KIT_ERROR_MESSAGES);

  public transform(
    errors: ValidationErrors | null | undefined,
    overrideMap?: Record<string, string>,
  ): string {
    if (!errors) {
      return '';
    }

    const firstKey = Object.keys(errors)[0];

    return overrideMap?.[firstKey] ?? this.messages[firstKey] ?? firstKey;
  }
}
