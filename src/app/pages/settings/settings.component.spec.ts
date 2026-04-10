import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppStore } from '@app/core/store/app/app.store';

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
      appStore.setTheme('light');
      fixture.detectChanges();

      const lightCard = compiled.querySelector('[data-testid="theme-option-light"]');

      expect(lightCard?.classList).toContain('theme-option--active');
    });
  });

  describe('Events', () => {
    it('should call appStore.setTheme when theme card clicked', () => {
      const spy = jest.spyOn(appStore, 'setTheme');

      (compiled.querySelector('[data-testid="theme-option-light"]') as HTMLElement).click();

      expect(spy).toHaveBeenCalledWith('light');
    });

    it('should navigate back to sidebar on back button click', () => {
      const spy = jest.spyOn(router, 'navigate');

      (compiled.querySelector('[data-testid="back-button"]') as HTMLElement).click();

      expect(spy).toHaveBeenCalledWith([{ outlets: { [ERouterOutlet.Left]: null } }]);
    });

    it('should toggle sound notifications signal', () => {
      const toggle = compiled.querySelector('[data-testid="sound-toggle"]') as HTMLInputElement;
      const initial = toggle.checked;

      toggle.click();
      fixture.detectChanges();

      expect(
        (compiled.querySelector('[data-testid="sound-toggle"]') as HTMLInputElement).checked,
      ).toBe(!initial);
    });

    it('should call appStore.setLanguage when language is changed', () => {
      const spy = jest.spyOn(appStore, 'setLanguage');

      fixture.componentInstance['onLanguageChange']('en');

      expect(spy).toHaveBeenCalledWith('en');
    });

    it('should not call appStore.setLanguage when null value is emitted', () => {
      const spy = jest.spyOn(appStore, 'setLanguage');

      fixture.componentInstance['onLanguageChange'](null);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle push notifications signal', () => {
      const toggle = compiled.querySelector('[data-testid="push-toggle"]') as HTMLInputElement;
      const initial = toggle.checked;

      toggle.click();
      fixture.detectChanges();

      expect(
        (compiled.querySelector('[data-testid="push-toggle"]') as HTMLInputElement).checked,
      ).toBe(!initial);
    });
  });
});
