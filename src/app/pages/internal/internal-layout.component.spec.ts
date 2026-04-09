import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalLayoutComponent } from './internal-layout.component';

describe('InternalLayoutComponent', () => {
  let fixture: ComponentFixture<InternalLayoutComponent>;
  let component: InternalLayoutComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InternalLayoutComponent],
    });

    fixture = TestBed.createComponent(InternalLayoutComponent);
    component = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('View', () => {
    it('should render sidebar', () => {
      fixture.detectChanges();

      const sidebar = fixture.nativeElement.querySelector('[data-testid="sidebar"]');

      expect(sidebar).toBeTruthy();
    });

    it('should render main area', () => {
      fixture.detectChanges();

      const main = fixture.nativeElement.querySelector('[data-testid="main"]');

      expect(main).toBeTruthy();
    });
  });
});
