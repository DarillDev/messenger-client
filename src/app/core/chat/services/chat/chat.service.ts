import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IChatDto } from '@shared/dtos/chat-dto.interface';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  public getChats(): Observable<IChatDto[]> {
    return this.http.get<IChatDto[]>('/api/chats');
  }

  public getMessages(chatId: string): Observable<IMessageDto[]> {
    return this.http.get<IMessageDto[]>(`/api/chats/${chatId}/messages`);
  }
}
