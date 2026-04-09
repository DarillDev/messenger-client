import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button [variant]="variant" [type]="type" [disabled]="disabled" [fullWidth]="fullWidth">
      Click me
    </app-button>
  `,
})
class TestHostComponent {
  public variant: 'primary' | 'secondary' = 'primary';
  public type: 'button' | 'submit' = 'button';
  public disabled = false;
  public fullWidth = false;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      const button = fixture.debugElement.query(By.directive(ButtonComponent));

      expect(button).toBeTruthy();
    });
  });

  describe('View', () => {
    it('should render primary variant by default', () => {
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');

      expect(btn.classList).toContain('btn-primary');
    });

    it('should render secondary variant', () => {
      host.variant = 'secondary';

      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');

      expect(btn.classList).toContain('btn-secondary');
    });

    it('should project content', () => {
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');

      expect(btn.textContent.trim()).toContain('Click me');
    });

    it('should set type attribute', () => {
      host.type = 'submit';

      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');

      expect(btn.type).toBe('submit');
    });

    it('should set disabled attribute', () => {
      host.disabled = true;

      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');

      expect(btn.disabled).toBe(true);
    });

    it('should apply full-width class on host', () => {
      host.fullWidth = true;

      fixture.detectChanges();

      const hostEl = fixture.nativeElement.querySelector('app-button');

      expect(hostEl.classList).toContain('full-width');
    });
  });
});
