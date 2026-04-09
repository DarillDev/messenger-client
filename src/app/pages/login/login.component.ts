import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/ui-kit/button';
import {
  FormFieldComponent,
  provideUiKitErrorMessages,
  wrapValidator,
} from '@shared/ui-kit/form-field';
import { GlassCardComponent } from '@shared/ui-kit/glass-card';
import { UiKitInputDirective } from '@shared/ui-kit/input';

import { LOGIN_FORM_ERRORS_TEXT } from './constants/login-form-errors-text.const';
import { ELoginFormErrorKey } from './enums/login-form-error-key.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GlassCardComponent,
    FormFieldComponent,
    UiKitInputDirective,
    ButtonComponent,
  ],
  providers: [provideUiKitErrorMessages(LOGIN_FORM_ERRORS_TEXT)],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', wrapValidator(Validators.required, ELoginFormErrorKey.UsernameRequired)],
    password: ['', wrapValidator(Validators.required, ELoginFormErrorKey.PasswordRequired)],
  });

  protected readonly isSubmitting = signal(false);

  protected onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    // TODO: will connect AuthService in the next phase
    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 1000);
  }
}
