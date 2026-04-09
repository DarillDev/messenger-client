import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have invalid form by default', () => {
      expect((component as unknown as { loginForm: { invalid: boolean } }).loginForm.invalid).toBe(
        true,
      );
    });
  });

  describe('View', () => {
    it('should render logo with Messenger text', () => {
      fixture.detectChanges();

      const logo = fixture.nativeElement.querySelector('.login-logo-text');

      expect(logo.textContent).toBe('Messenger');
    });

    it('should render two form fields', () => {
      fixture.detectChanges();

      const fields = fixture.nativeElement.querySelectorAll('ui-kit-form-field');

      expect(fields.length).toBe(2);
    });

    it('should render submit button', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('app-button');

      expect(button).toBeTruthy();
    });
  });

  describe('Events', () => {
    it('should show errors when submitted with empty fields', fakeAsync(() => {
      fixture.detectChanges();

      (component as unknown as { onSubmit(): void }).onSubmit();
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input');
      inputs.forEach((input: HTMLInputElement) => {
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));
      });
      fixture.detectChanges();

      const errors = fixture.nativeElement.querySelectorAll('.form-field-error');

      expect(errors.length).toBeGreaterThan(0);

      tick(1000);
    }));

    it('should show custom error text from DI', fakeAsync(() => {
      fixture.detectChanges();

      (component as unknown as { onSubmit(): void }).onSubmit();
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input');
      inputs.forEach((input: HTMLInputElement) => {
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));
      });
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.form-field-error');

      expect(error.textContent).toContain('Enter your username');

      tick(1000);
    }));

    it('should set isSubmitting when form is valid', fakeAsync(() => {
      fixture.detectChanges();

      const form = (
        component as unknown as {
          loginForm: {
            controls: {
              username: { setValue(v: string): void };
              password: { setValue(v: string): void };
            };
          };
        }
      ).loginForm;
      form.controls.username.setValue('admin');
      form.controls.password.setValue('123');

      (component as unknown as { onSubmit(): void }).onSubmit();

      expect((component as unknown as { isSubmitting: () => boolean }).isSubmitting()).toBe(true);

      tick(1000);

      expect((component as unknown as { isSubmitting: () => boolean }).isSubmitting()).toBe(false);
    }));
  });
});
