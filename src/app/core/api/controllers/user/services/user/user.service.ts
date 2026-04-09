import { inject, Injectable } from '@angular/core';
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
}
