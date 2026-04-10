import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  APPLICATION_ENVIRONMENT,
  IApplicationEnvironment,
} from '@core/environment/application-environment.token';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly env = inject<IApplicationEnvironment>(APPLICATION_ENVIRONMENT);

  private url(path: string): string {
    return `${this.env.apiUrl}${path}`;
  }

  public get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path));
  }

  public post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  public put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  public delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }
}
