import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ISelectOption, SelectComponent } from './select.component';

@Component({
  template: `<ui-kit-select [options]="options" [(value)]="value" />`,
  imports: [SelectComponent],
})
class TestHostComponent {
  options: ISelectOption<string>[] = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
  ];
  value = signal<string | null>(null);
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let compiled: HTMLElement;
  let overlayContainer: OverlayContainer;
  let overlayEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement;

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayEl = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('Model', () => {
    it('should display placeholder when no value selected', () => {
      expect(compiled.querySelector('.select-trigger-label')?.textContent?.trim()).toBe(
        'Выбрать...',
      );
    });

    it('should display selected option label', () => {
      fixture.componentInstance.value.set('ru');
      fixture.detectChanges();

      expect(compiled.querySelector('.select-trigger-label')?.textContent?.trim()).toBe('Русский');
    });
  });

  describe('View', () => {
    it('should not show dropdown by default', () => {
      expect(overlayEl.querySelector('[data-testid="select-dropdown"]')).toBeNull();
    });

    it('should show dropdown when trigger clicked', () => {
      (compiled.querySelector('[data-testid="select-trigger"]') as HTMLElement).click();
      fixture.detectChanges();

      expect(overlayEl.querySelector('[data-testid="select-dropdown"]')).not.toBeNull();
    });
  });

  describe('Events', () => {
    it('should update value when option selected', () => {
      (compiled.querySelector('[data-testid="select-trigger"]') as HTMLElement).click();
      fixture.detectChanges();

      const options = overlayEl.querySelectorAll('[data-testid="select-option"]');
      (options[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toBe('en');
    });

    it('should close dropdown after option selected', () => {
      (compiled.querySelector('[data-testid="select-trigger"]') as HTMLElement).click();
      fixture.detectChanges();

      const options = overlayEl.querySelectorAll('[data-testid="select-option"]');
      (options[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(overlayEl.querySelector('[data-testid="select-dropdown"]')).toBeNull();
    });
  });
});
