import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@app/core/store/auth/auth.store';
import { ButtonComponent } from '@shared/ui-kit/button';
import {
  FormFieldComponent,
  provideUiKitErrorMessages,
  wrapValidator,
} from '@shared/ui-kit/form-field';
import { GlassCardComponent } from '@shared/ui-kit/glass-card';
import { UiKitInputDirective } from '@shared/ui-kit/input';
import { createDestroyer } from '@shared/utils/create-destroyer';

import { LOGIN_FORM_ERRORS_TEXT } from './constants/login-form-errors-text.const';
import { ELoginFormErrorKey } from './enums/login-form-error-key.enum';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    GlassCardComponent,
    FormFieldComponent,
    UiKitInputDirective,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [provideUiKitErrorMessages(LOGIN_FORM_ERRORS_TEXT)],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly destroyer = createDestroyer();

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

    const { username, password } = this.loginForm.getRawValue();

    this.authStore
      .login({ userName: username, password })
      .pipe(this.destroyer())
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.loginForm.controls.username.setErrors({
            [ELoginFormErrorKey.ServerError]: true,
          });
        },
      });
  }
}
