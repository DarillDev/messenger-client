import { inject, Injectable } from '@angular/core';
import { IUserDetails } from '@shared/interfaces/user-details.interface';
import { IUser } from '@shared/interfaces/user.interface';
import { map, Observable } from 'rxjs';

import { UserMapper } from '../../mappers/user/user.mapper';
import { UserApiService } from '../user-api/user-api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userApi = inject(UserApiService);

  public getCurrentUser(): Observable<IUser> {
    return this.userApi.getCurrentUser().pipe(map(dto => UserMapper.fromDto(dto)));
  }

  public getUserDetails(userId: string): Observable<IUserDetails> {
    return this.userApi.getDetails(userId).pipe(map(dto => UserMapper.fromDetailsDto(dto)));
  }
}
