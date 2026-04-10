import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { IUserDetails } from '@shared/interfaces/user-details.interface';

import { UserService } from './user.service';

const mockEnv = { apiUrl: 'http://localhost:3000' };

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_ENVIRONMENT, useValue: mockEnv },
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getUserDetails', () => {
    it('should map DTO to IUserDetails domain model', () => {
      const dto = {
        userId: 'u1',
        userName: 'Stepan',
        isOnline: true,
        email: 'stepan@example.com',
        phone: '+7 (999) 111-11-11',
        location: 'Москва, Россия',
        stats: { contacts: 4, chats: 4, messages: 142 },
      };

      let result: IUserDetails | undefined;
      service.getUserDetails('u1').subscribe(details => (result = details));

      const request = httpMock.expectOne('http://localhost:3000/api/user/u1/details');
      request.flush(dto);

      expect(result).toEqual({
        userId: 'u1',
        userName: 'Stepan',
        isOnline: true,
        email: 'stepan@example.com',
        phone: '+7 (999) 111-11-11',
        location: 'Москва, Россия',
        stats: { contacts: 4, chats: 4, messages: 142 },
      });
    });
  });
});
