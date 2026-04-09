import { ComponentFixture, TestBed } from '@angular/core/testing';

import { App } from './app.component';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
    });

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
