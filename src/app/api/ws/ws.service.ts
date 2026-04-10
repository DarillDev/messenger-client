import { inject, Injectable } from '@angular/core';
import {
  APPLICATION_ENVIRONMENT,
  IApplicationEnvironment,
} from '@core/environment/application-environment.token';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class WsService {
  private readonly env = inject<IApplicationEnvironment>(APPLICATION_ENVIRONMENT);

  public connect(token: string): Socket {
    return io(this.env.apiUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
}
