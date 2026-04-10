import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiKitInputDirective } from '@shared/ui-kit/input';

import { FormFieldComponent } from './form-field.component';
import { UiKitPrefixDirective } from '../../directives/prefix/prefix.directive';
import { UiKitSuffixDirective } from '../../directives/suffix/suffix.directive';

@Component({
  standalone: true,
  imports: [
    FormFieldComponent,
    UiKitInputDirective,
    UiKitPrefixDirective,
    UiKitSuffixDirective,
    ReactiveFormsModule,
  ],
  template: `
    <ui-kit-form-field [label]="label" [hint]="hint" [errorMessages]="errorMessages">
      @if (showPrefix) {
        <span uiKitPrefix class="material-icons-round">person</span>
      }
      <input uiKitInput [formControl]="control" placeholder="Enter username" />
      @if (showSuffix) {
        <span uiKitSuffix class="material-icons-round">clear</span>
      }
    </ui-kit-form-field>
  `,
})
class TestHostComponent {
  public control = new FormControl('', Validators.required);
  public label = 'Username';
  public hint = '';
  public errorMessages: Record<string, string> = { required: 'This field is required' };
  public showPrefix = false;
  public showSuffix = false;
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  describe('View', () => {
    it('should render label when label is provided', () => {
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.form-field-label');

      expect(label.textContent).toBe('Username');
    });

    it('should not render label when label is not provided', () => {
      host.label = '';
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.form-field-label');

      expect(label).toBeNull();
    });

    it('should not render subscript when there is no hint and no ngControl', () => {
      fixture.detectChanges();

      const subscript = fixture.nativeElement.querySelector('.form-field-subscript');

      expect(subscript).toBeTruthy();
    });

    it('should float label when input is focused', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('.form-field');

      expect(formField.classList).toContain('focused');
    });

    it('should float label when input has value', () => {
      host.control.setValue('test');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('.form-field');

      expect(formField.classList).toContain('filled');
    });

    it('should show error when control is invalid and touched', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.form-field-error');

      expect(error).toBeTruthy();
      expect(error.textContent).toContain('This field is required');
    });

    it('should show hint when no error', () => {
      host.hint = 'Enter your username';
      host.control.setValue('filled');
      fixture.detectChanges();

      const hint = fixture.nativeElement.querySelector('.form-field-hint');

      expect(hint.textContent).toContain('Enter your username');
    });

    it('should fall back to default DI map when no override provided', () => {
      host.errorMessages = {};
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.form-field-error');

      expect(error).toBeTruthy();
      expect(error.textContent).toContain('Required field');
    });

    it('should render prefix when provided', () => {
      host.showPrefix = true;
      fixture.detectChanges();

      const prefix = fixture.nativeElement.querySelector('.form-field-prefix');

      expect(prefix).toBeTruthy();
    });

    it('should render suffix when provided', () => {
      host.showSuffix = true;
      fixture.detectChanges();

      const suffix = fixture.nativeElement.querySelector('.form-field-suffix');

      expect(suffix).toBeTruthy();
    });
  });
});
