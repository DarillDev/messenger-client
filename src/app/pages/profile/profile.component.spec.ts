import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { ERouterOutlet } from '../../internal-layout/enums/router-outlet.enum';
import { AuthStore } from '@store/auth/auth.store';
import { UserStore } from '@store/user/user.store';
import { ProfileComponent } from './profile.component';

const mockEnv = { apiUrl: 'http://localhost:3000' };

const mockUserDetails = {
  userId: 'u2',
  userName: 'Alex',
  isOnline: true,
  email: 'alex@example.com',
  phone: '+7 (999) 222-22-22',
  location: 'Санкт-Петербург, Россия',
  stats: { contacts: 3, chats: 3, messages: 87 },
};

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let compiled: HTMLElement;
  let httpMock: HttpTestingController;
  let router: Router;

  function createComponent(userId: string, currentUserId = 'u1'): void {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { paramMap: of(convertToParamMap({ id: userId })) },
    });

    const userStore = TestBed.inject(UserStore);
    userStore.setUser({ userId: currentUserId, userName: 'Stepan', isOnline: true });

    fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_ENVIRONMENT, useValue: mockEnv },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    httpMock?.match(() => true);
    httpMock?.verify();
  });

  describe('Model', () => {
    it('should show loading skeleton initially', () => {
      // Act
      createComponent('u2');
      httpMock = TestBed.inject(HttpTestingController);

      // Assert
      expect(compiled.querySelector('[data-testid="profile-skeleton"]')).not.toBeNull();
    });

    it('should display user details after loading', fakeAsync(() => {
      // Arrange
      createComponent('u2');
      httpMock = TestBed.inject(HttpTestingController);

      // Act
      httpMock.expectOne('http://localhost:3000/api/user/u2/details').flush(mockUserDetails);
      tick();
      fixture.detectChanges();

      // Assert
      expect(compiled.querySelector('[data-testid="profile-name"]')?.textContent).toContain('Alex');
    }));

    it('should not show own-profile actions for another user', fakeAsync(() => {
      // Arrange
      createComponent('u2', 'u1');
      httpMock = TestBed.inject(HttpTestingController);

      // Act
      httpMock.expectOne('http://localhost:3000/api/user/u2/details').flush(mockUserDetails);
      tick();
      fixture.detectChanges();

      // Assert
      expect(compiled.querySelector('[data-testid="logout-button"]')).toBeNull();
    }));

    it('should show own-profile actions when viewing own profile', fakeAsync(() => {
      // Arrange
      createComponent('u1', 'u1');
      httpMock = TestBed.inject(HttpTestingController);

      // Act
      httpMock.expectOne('http://localhost:3000/api/user/u1/details').flush({
        ...mockUserDetails,
        userId: 'u1',
        userName: 'Stepan',
      });
      tick();
      fixture.detectChanges();

      // Assert
      expect(compiled.querySelector('[data-testid="logout-button"]')).not.toBeNull();
    }));
  });

  describe('Events', () => {
    it('should call authStore.logout when logout button is clicked', fakeAsync(() => {
      // Arrange
      createComponent('u1', 'u1');
      httpMock = TestBed.inject(HttpTestingController);
      const authStore = TestBed.inject(AuthStore);
      const spy = jest.spyOn(authStore, 'logout').mockImplementation(() => {});

      httpMock.expectOne('http://localhost:3000/api/user/u1/details').flush({
        ...mockUserDetails,
        userId: 'u1',
        userName: 'Stepan',
      });
      tick();
      fixture.detectChanges();

      // Act
      (compiled.querySelector('[data-testid="logout-button"]') as HTMLElement).click();

      // Assert
      expect(spy).toHaveBeenCalled();
    }));

    it('should clear right outlet when close button clicked', () => {
      // Arrange
      createComponent('u2');
      httpMock = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);
      const spy = jest.spyOn(router, 'navigate');

      // Act
      (compiled.querySelector('[data-testid="close-button"]') as HTMLElement).click();

      // Assert
      expect(spy).toHaveBeenCalledWith([{ outlets: { [ERouterOutlet.Right]: null } }]);
    });
  });
});
