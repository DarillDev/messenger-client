import { inject, Injectable } from '@angular/core';
import { MessageMapper } from '@core/api/controllers/chat/mappers/message/message.mapper';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { ChatStore } from '@store/chat/chat.store';
import { MessageStore } from '@store/message/message.store';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly chatStore = inject(ChatStore);
  private readonly messageStore = inject(MessageStore);

  private socket: Socket | null = null;

  public connect(): void {
    const token = this.tokenStorage.getAccessToken();

    this.socket = io('http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
    });

    this.socket.on('message:new', ({ chatId, message }: { chatId: string; message: IMessageDto }) => {
      const mappedMessage = MessageMapper.fromDto(message);
      this.messageStore.addMessage(chatId, mappedMessage);
      this.chatStore.updateLastMessage(mappedMessage);
    });

    this.socket.on('typing', ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
      this.messageStore.setTyping(chatId, userId, isTyping);
    });

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
  }

  public emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }
}
