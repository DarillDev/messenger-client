import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UiKitSuffixDirective } from './suffix.directive';

@Component({
  standalone: true,
  imports: [UiKitSuffixDirective],
  template: '<span uiKitSuffix>icon</span>',
})
class TestHostComponent {}

describe('UiKitSuffixDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.directive(UiKitSuffixDirective));

    expect(el).toBeTruthy();
  });
});
