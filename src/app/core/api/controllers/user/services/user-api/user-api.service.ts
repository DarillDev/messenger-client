import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/api/http/http.service';
import { IUserDto } from '@shared/dtos/user-dto.interface';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpService);

  public getCurrentUser(): Observable<IUserDto> {
    return this.http.get<IUserDto>('/api/users/me');
  }
}
