import { inject, Injectable } from '@angular/core';
import { IMessageDto } from '@core/api/controllers/chat/dtos/message-dto.interface';
import { MessageMapper } from '@core/api/controllers/chat/mappers/message/message.mapper';
import { WsService } from '@core/api/ws/ws.service';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';
import { IMessage } from '@shared/interfaces/message.interface';
import { ChatStore } from '@store/chat/chat.store';
import { Socket } from 'socket.io-client';

@Injectable()
export class MessagesService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly wsService = inject(WsService);
  private readonly chatStore = inject(ChatStore);

  private socket: Socket | null = null;
  private messageStore: {
    addMessage(chatId: string, message: IMessage): void;
    setTyping(chatId: string, userId: string, isTyping: boolean): void;
  } | null = null;

  public connect(messageStore: MessagesService['messageStore']): void {
    this.messageStore = messageStore;
    const token = this.tokenStorage.getAccessToken() ?? '';

    this.socket = this.wsService.connect(token);

    this.socket.on(
      'message:new',
      ({ chatId, message }: { chatId: string; message: IMessageDto }) => {
        const mapped = MessageMapper.fromDto(message);
        this.messageStore?.addMessage(chatId, mapped);
        this.chatStore.updateLastMessage(mapped);
      },
    );

    this.socket.on(
      'typing',
      ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
        this.messageStore?.setTyping(chatId, userId, isTyping);
      },
    );

    this.socket.on('user:online', ({ userId }: { userId: string }) => {
      this.chatStore.updateOnlineStatus(userId, true);
    });

    this.socket.on('user:offline', ({ userId }: { userId: string }) => {
      this.chatStore.updateOnlineStatus(userId, false);
    });
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.messageStore = null;
  }

  public emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }
}
