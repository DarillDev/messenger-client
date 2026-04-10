import { inject, Injectable } from '@angular/core';
import { HttpService } from '@core/api/http/http.service';
import { IUserDetailsDto } from '@shared/dtos/user-details-dto.interface';
import { IUserDto } from '@shared/dtos/user-dto.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpService);

  public getCurrentUser(): Observable<IUserDto> {
    return this.http.get<IUserDto>('/api/users/me');
  }

  public getDetails(userId: string): Observable<IUserDetailsDto> {
    return this.http.get<IUserDetailsDto>(`/api/user/${userId}/details`);
  }
}
