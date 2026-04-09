import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@store/auth/auth.store';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: class {} as never }]),
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
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
    it('should show errors when submitted with empty fields', () => {
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
    });

    it('should show custom error text from DI', () => {
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
    });

    it('should set isSubmitting and call AuthStore.login on valid submit', () => {
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
      form.controls.username.setValue('Stepan');
      form.controls.password.setValue('pass123');

      (component as unknown as { onSubmit(): void }).onSubmit();

      expect((component as unknown as { isSubmitting: () => boolean }).isSubmitting()).toBe(true);

      const request = httpTesting.expectOne('/api/auth/login');

      expect(request.request.body).toEqual({ userName: 'Stepan', password: 'pass123' });

      request.flush({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: { userId: 'u1', userName: 'Stepan', isOnline: true },
      });
    });

    it('should navigate to / on successful login', () => {
      fixture.detectChanges();
      const navigateSpy = jest.spyOn(router, 'navigate');

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
      form.controls.username.setValue('Stepan');
      form.controls.password.setValue('pass123');

      (component as unknown as { onSubmit(): void }).onSubmit();

      const request = httpTesting.expectOne('/api/auth/login');
      request.flush({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: { userId: 'u1', userName: 'Stepan', isOnline: true },
      });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should show server error on login failure', () => {
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
      form.controls.username.setValue('wrong');
      form.controls.password.setValue('wrong');

      (component as unknown as { onSubmit(): void }).onSubmit();

      const request = httpTesting.expectOne('/api/auth/login');
      request.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect((component as unknown as { isSubmitting: () => boolean }).isSubmitting()).toBe(false);
    });
  });
});
