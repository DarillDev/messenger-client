import { DatePipe, registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { Component, input, LOCALE_ID } from '@angular/core';

registerLocaleData(localeRu);

@Component({
  selector: 'app-date-divider',
  imports: [DatePipe],
  templateUrl: './date-divider.component.html',
  styleUrl: './date-divider.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'ru' }],
})
export class DateDividerComponent {
  public readonly date = input.required<Date>();
}
