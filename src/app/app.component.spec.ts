import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app.component';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('View', () => {
    it('should render router-outlet', () => {
      fixture.detectChanges();

      const outlet = fixture.nativeElement.querySelector('router-outlet');

      expect(outlet).toBeTruthy();
    });
  });
});
