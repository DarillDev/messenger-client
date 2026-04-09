import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassCardComponent } from './glass-card.component';

@Component({
  standalone: true,
  imports: [GlassCardComponent],
  template: '<app-glass-card><p data-testid="projected">Hello</p></app-glass-card>',
})
class TestHostComponent {}

describe('GlassCardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
  });

  describe('Model', () => {
    it('should create', () => {
      const card = fixture.nativeElement.querySelector('app-glass-card');

      expect(card).toBeTruthy();
    });
  });

  describe('View', () => {
    it('should project content', () => {
      fixture.detectChanges();

      const projected = fixture.nativeElement.querySelector('[data-testid="projected"]');

      expect(projected).toBeTruthy();
      expect(projected.textContent).toBe('Hello');
    });
  });
});
