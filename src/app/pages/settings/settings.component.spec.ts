import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppStore } from '@store/app/app.store';

import { SettingsComponent } from './settings.component';
import { ERouterOutlet } from '../../internal-layout/enums/router-outlet.enum';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let compiled: HTMLElement;
  let appStore: InstanceType<typeof AppStore>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    appStore = TestBed.inject(AppStore);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  describe('Model', () => {
    it('should reflect current theme from AppStore', () => {
      // Arrange
      appStore.setTheme('light');
      fixture.detectChanges();

      // Assert
      const lightCard = compiled.querySelector('[data-testid="theme-option-light"]');
      expect(lightCard?.classList).toContain('theme-option--active');
    });
  });

  describe('Events', () => {
    it('should call appStore.setTheme when theme card clicked', () => {
      // Arrange
      const spy = jest.spyOn(appStore, 'setTheme');

      // Act
      (compiled.querySelector('[data-testid="theme-option-light"]') as HTMLElement).click();

      // Assert
      expect(spy).toHaveBeenCalledWith('light');
    });

    it('should navigate back to sidebar on back button click', () => {
      // Arrange
      const spy = jest.spyOn(router, 'navigate');

      // Act
      (compiled.querySelector('[data-testid="back-button"]') as HTMLElement).click();

      // Assert
      expect(spy).toHaveBeenCalledWith([{ outlets: { [ERouterOutlet.Left]: null } }]);
    });

    it('should toggle sound notifications signal', () => {
      // Arrange
      const toggle = compiled.querySelector('[data-testid="sound-toggle"]') as HTMLInputElement;
      const initial = toggle.checked;

      // Act
      toggle.click();
      fixture.detectChanges();

      // Assert
      expect(
        (compiled.querySelector('[data-testid="sound-toggle"]') as HTMLInputElement).checked,
      ).toBe(!initial);
    });

    it('should call appStore.setLanguage when language is changed', () => {
      // Arrange
      const spy = jest.spyOn(appStore, 'setLanguage');

      // Act
      fixture.componentInstance['onLanguageChange']('en');

      // Assert
      expect(spy).toHaveBeenCalledWith('en');
    });

    it('should not call appStore.setLanguage when null value is emitted', () => {
      // Arrange
      const spy = jest.spyOn(appStore, 'setLanguage');

      // Act
      fixture.componentInstance['onLanguageChange'](null);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle push notifications signal', () => {
      // Arrange
      const toggle = compiled.querySelector('[data-testid="push-toggle"]') as HTMLInputElement;
      const initial = toggle.checked;

      // Act
      toggle.click();
      fixture.detectChanges();

      // Assert
      expect(
        (compiled.querySelector('[data-testid="push-toggle"]') as HTMLInputElement).checked,
      ).toBe(!initial);
    });
  });
});
