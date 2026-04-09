import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UiKitPrefixDirective } from './prefix.directive';

@Component({
  standalone: true,
  imports: [UiKitPrefixDirective],
  template: '<span uiKitPrefix>icon</span>',
})
class TestHostComponent {}

describe('UiKitPrefixDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.directive(UiKitPrefixDirective));

    expect(el).toBeTruthy();
  });
});
