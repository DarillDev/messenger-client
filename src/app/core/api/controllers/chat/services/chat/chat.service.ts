import { inject, Injectable } from '@angular/core';
import { IChat } from '@shared/interfaces/chat.interface';
import { IMessage } from '@shared/interfaces/message.interface';
import { map, Observable } from 'rxjs';

import { ChatMapper } from '../../mappers/chat/chat.mapper';
import { MessageMapper } from '../../mappers/message/message.mapper';
import { ChatApiService } from '../chat-api/chat-api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly chatApi = inject(ChatApiService);

  public getChats(): Observable<IChat[]> {
    return this.chatApi.getChats().pipe(map(dtos => dtos.map(dto => ChatMapper.fromDto(dto))));
  }

  public getMessages(chatId: string): Observable<IMessage[]> {
    return this.chatApi
      .getMessages(chatId)
      .pipe(map(dtos => dtos.map(dto => MessageMapper.fromDto(dto))));
  }
}
