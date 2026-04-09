import { inject, Injectable } from '@angular/core';
import { HttpService } from '@core/api/http/http.service';
import { Observable } from 'rxjs';

import { IChatDto } from '../../dtos/chat-dto.interface';
import { IMessageDto } from '../../dtos/message-dto.interface';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpService);

  public getChats(): Observable<IChatDto[]> {
    return this.http.get<IChatDto[]>('/api/chats');
  }

  public getMessages(chatId: string): Observable<IMessageDto[]> {
    return this.http.get<IMessageDto[]>(`/api/chats/${chatId}/messages`);
  }
}
