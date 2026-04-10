import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore, TLanguage, TTheme } from '@app/core/store/app/app.store';
import { ISelectOption, SelectComponent } from '@shared/ui-kit/select';

import { ERouterOutlet } from '../../internal-layout/enums/router-outlet.enum';

@Component({
  selector: 'app-settings',
  imports: [SelectComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly router = inject(Router);

  protected readonly appStore = inject(AppStore);

  protected readonly pushNotifications = signal(true);
  protected readonly soundNotifications = signal(true);

  protected readonly languageOptions: ISelectOption<TLanguage>[] = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
  ];

  protected setTheme(theme: TTheme): void {
    this.appStore.setTheme(theme);
  }

  protected onLanguageChange(value: TLanguage | null): void {
    if (value) {
      this.appStore.setLanguage(value);
    }
  }

  protected goBack(): void {
    void this.router.navigate([{ outlets: { [ERouterOutlet.Left]: null } }]);
  }
}
