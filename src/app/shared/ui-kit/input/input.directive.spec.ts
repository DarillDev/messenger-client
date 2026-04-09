import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { UiKitInputDirective } from './input.directive';

@Component({
  standalone: true,
  imports: [UiKitInputDirective, ReactiveFormsModule],
  template: '<input uiKitInput [formControl]="control" placeholder="Enter text" />',
})
class TestHostComponent {
  public control = new FormControl('');
  public readonly directive = viewChild(UiKitInputDirective);
}

describe('UiKitInputDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Model', () => {
    it('should create', () => {
      expect(host.directive()).toBeTruthy();
    });

    it('should report isEmpty when input has no value', () => {
      expect(host.directive()!.isEmpty).toBe(true);
    });

    it('should report not empty when input has value', () => {
      host.control.setValue('test');
      fixture.detectChanges();

      expect(host.directive()!.isEmpty).toBe(false);
    });

    it('should report isFocused on focus', () => {
      const input = fixture.nativeElement.querySelector('input');

      input.dispatchEvent(new Event('focus'));

      expect(host.directive()!.isFocused).toBe(true);
    });

    it('should report not focused on blur', () => {
      const input = fixture.nativeElement.querySelector('input');

      input.dispatchEvent(new Event('focus'));
      input.dispatchEvent(new Event('blur'));

      expect(host.directive()!.isFocused).toBe(false);
    });

    it('should have placeholder from native input', () => {
      expect(host.directive()!.placeholder).toBe('Enter text');
    });

    it('should have ngControl reference', () => {
      expect(host.directive()!.ngControl).toBeTruthy();
    });

    it('should emit stateChanges on focus', done => {
      host.directive()!.stateChanges.subscribe(() => {
        done();
      });

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('focus'));
    });
  });

  describe('View', () => {
    it('should have unique id on input', () => {
      const input = fixture.nativeElement.querySelector('input');

      expect(input.id).toMatch(/^ui-kit-input-\d+$/);
    });

    it('should apply error class when control is invalid and touched', () => {
      host.control.setErrors({ required: true });
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');

      expect(input.classList).toContain('ui-kit-input-error');
    });
  });
});
