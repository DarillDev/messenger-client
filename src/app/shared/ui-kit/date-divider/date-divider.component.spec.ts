import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateDividerComponent } from './date-divider.component';

describe('DateDividerComponent', () => {
  let fixture: ComponentFixture<DateDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateDividerComponent);
    fixture.componentRef.setInput('date', '2026-04-10T10:00:00Z');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render with a date string input', () => {
    expect(fixture.nativeElement.textContent).toBeTruthy();
  });
});
