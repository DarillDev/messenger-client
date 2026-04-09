import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Module,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NestFactory } from '@nestjs/core';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';

const JWT_SECRET = 'mock-secret-key-for-dev-only';
const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '7d';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IUser {
  userId: string;
  userName: string;
  password: string;
  isOnline: boolean;
}

interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface IChat {
  id: string;
  participantIds: string[];
  lastMessage: IMessage;
  updatedAt: string;
  unreadCount: number;
}

// ─── In-memory DB ─────────────────────────────────────────────────────────────

export const users: IUser[] = [
  { userId: 'u1', userName: 'Stepan', password: 'pass123', isOnline: true },
  { userId: 'u2', userName: 'Alex', password: 'pass123', isOnline: true },
  { userId: 'u3', userName: 'Maria', password: 'pass123', isOnline: false },
  { userId: 'u4', userName: 'Denis', password: 'pass123', isOnline: true },
  { userId: 'u5', userName: 'Olga', password: 'pass123', isOnline: false },
];

export const messagesByChat: Record<string, IMessage[]> = {
  c1: [
    { id: 'msg-c1-1', chatId: 'c1', senderId: 'u2', text: 'Привет! Как дела?', createdAt: '2026-04-10T08:00:00.000Z' },
    { id: 'msg-c1-2', chatId: 'c1', senderId: 'u1', text: 'Отлично, работаю над проектом!', createdAt: '2026-04-10T08:01:00.000Z' },
    { id: 'msg-c1-3', chatId: 'c1', senderId: 'u2', text: 'Интересно, расскажи подробнее', createdAt: '2026-04-10T08:02:00.000Z' },
  ],
  c2: [
    { id: 'msg-c2-1', chatId: 'c2', senderId: 'u1', text: 'Мария, ты сегодня онлайн?', createdAt: '2026-04-09T18:00:00.000Z' },
    { id: 'msg-c2-2', chatId: 'c2', senderId: 'u3', text: 'Да, только зашла', createdAt: '2026-04-09T18:05:00.000Z' },
  ],
  c3: [
    { id: 'msg-c3-1', chatId: 'c3', senderId: 'u4', text: 'Денис здесь', createdAt: '2026-04-08T12:00:00.000Z' },
    { id: 'msg-c3-2', chatId: 'c3', senderId: 'u1', text: 'Привет Денис!', createdAt: '2026-04-08T12:01:00.000Z' },
  ],
  c4: [
    { id: 'msg-c4-1', chatId: 'c4', senderId: 'u5', text: 'Можем созвониться?', createdAt: '2026-04-07T15:00:00.000Z' },
    { id: 'msg-c4-2', chatId: 'c4', senderId: 'u1', text: 'Конечно, когда?', createdAt: '2026-04-07T15:02:00.000Z' },
  ],
};

export const chats: IChat[] = [
  {
    id: 'c1',
    participantIds: ['u1', 'u2'],
    lastMessage: messagesByChat['c1'][messagesByChat['c1'].length - 1],
    updatedAt: '2026-04-10T08:02:00.000Z',
    unreadCount: 1,
  },
  {
    id: 'c2',
    participantIds: ['u1', 'u3'],
    lastMessage: messagesByChat['c2'][messagesByChat['c2'].length - 1],
    updatedAt: '2026-04-09T18:05:00.000Z',
    unreadCount: 0,
  },
  {
    id: 'c3',
    participantIds: ['u1', 'u4'],
    lastMessage: messagesByChat['c3'][messagesByChat['c3'].length - 1],
    updatedAt: '2026-04-08T12:01:00.000Z',
    unreadCount: 0,
  },
  {
    id: 'c4',
    participantIds: ['u1', 'u5'],
    lastMessage: messagesByChat['c4'][messagesByChat['c4'].length - 1],
    updatedAt: '2026-04-07T15:02:00.000Z',
    unreadCount: 0,
  },
];

// ─── Auth Controller ───────────────────────────────────────────────────────────

@Controller('api/auth')
class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  @HttpCode(200)
  public login(@Body() body: { userName: string; password: string }): {
    accessToken: string;
    refreshToken: string;
    user: Omit<IUser, 'password'>;
  } {
    const user = users.find(u => u.userName === body.userName && u.password === body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.userId, userName: user.userName };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
      user: {
        userId: user.userId,
        userName: user.userName,
        isOnline: user.isOnline,
      },
    };
  }

  @Post('refresh')
  @HttpCode(200)
  public refresh(@Body() body: { refreshToken: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const decoded = this.jwtService.verify<{ userId: string; userName: string }>(
        body.refreshToken,
      );

      const user = users.find(u => u.userId === decoded.userId);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = { userId: user.userId, userName: user.userName };

      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
        refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// ─── Chats Controller ─────────────────────────────────────────────────────────

@Controller('api/chats')
class ChatsController {
  constructor(private readonly jwtService: JwtService) {}

  @Get()
  public getChats(@Headers('authorization') authHeader: string): object[] {
    const token = authHeader?.replace('Bearer ', '');
    const { userId } = this.jwtService.verify<{ userId: string }>(token, {
      secret: JWT_SECRET,
    });

    return chats
      .filter(chat => chat.participantIds.includes(userId))
      .map(chat => {
        const otherUserId = chat.participantIds.find(id => id !== userId)!;
        const participant = users.find(u => u.userId === otherUserId)!;

        return {
          id: chat.id,
          participant: {
            userId: participant.userId,
            userName: participant.userName,
            isOnline: participant.isOnline,
          },
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt,
          unreadCount: chat.unreadCount,
        };
      });
  }

  @Get(':id/messages')
  public getMessages(
    @Headers('authorization') authHeader: string,
    @Param('id') chatId: string,
  ): IMessage[] {
    const token = authHeader?.replace('Bearer ', '');
    const { userId } = this.jwtService.verify<{ userId: string }>(token, {
      secret: JWT_SECRET,
    });

    const chat = chats.find(c => c.id === chatId);
    if (!chat?.participantIds.includes(userId)) {
      return [];
    }

    return messagesByChat[chatId] ?? [];
  }
}

// ─── WebSocket Gateway ────────────────────────────────────────────────────────

@WebSocketGateway({ cors: { origin: '*' } })
class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly connectedUsers = new Map<string, Socket>();

  constructor(private readonly jwtService: JwtService) {}

  public handleConnection(client: Socket): void {
    try {
      const token = client.handshake.auth['token'] as string;
      const payload = this.jwtService.verify<{ userId: string }>(token, {
        secret: JWT_SECRET,
      });

      client.data['userId'] = payload.userId;
      this.connectedUsers.set(payload.userId, client);

      const user = users.find(u => u.userId === payload.userId);
      if (user) user.isOnline = true;

      this.broadcastExcept(payload.userId, 'user:online', { userId: payload.userId });
    } catch {
      client.disconnect();
    }
  }

  public handleDisconnect(client: Socket): void {
    const userId = client.data['userId'] as string | undefined;

    if (userId) {
      this.connectedUsers.delete(userId);

      const user = users.find(u => u.userId === userId);
      if (user) user.isOnline = false;

      this.broadcastExcept(userId, 'user:offline', { userId });
    }
  }

  @SubscribeMessage('message:send')
  public handleMessageSend(
    client: Socket,
    payload: { chatId: string; text: string },
  ): void {
    const senderId = client.data['userId'] as string;

    const message: IMessage = {
      id: `msg-${Date.now()}`,
      chatId: payload.chatId,
      senderId,
      text: payload.text,
      createdAt: new Date().toISOString(),
    };

    if (!messagesByChat[payload.chatId]) {
      messagesByChat[payload.chatId] = [];
    }
    messagesByChat[payload.chatId].push(message);

    const chat = chats.find(c => c.id === payload.chatId);
    if (chat) {
      chat.lastMessage = message;
      chat.updatedAt = message.createdAt;
    }

    const participants = this.getParticipants(payload.chatId);
    participants.forEach(userId => {
      this.connectedUsers.get(userId)?.emit('message:new', {
        chatId: payload.chatId,
        message,
      });
    });
  }

  @SubscribeMessage('typing:start')
  public handleTypingStart(client: Socket, payload: { chatId: string }): void {
    this.broadcastTyping(client, payload.chatId, true);
  }

  @SubscribeMessage('typing:stop')
  public handleTypingStop(client: Socket, payload: { chatId: string }): void {
    this.broadcastTyping(client, payload.chatId, false);
  }

  private broadcastTyping(client: Socket, chatId: string, isTyping: boolean): void {
    const userId = client.data['userId'] as string;
    const participants = this.getParticipants(chatId);

    participants
      .filter(id => id !== userId)
      .forEach(id => {
        this.connectedUsers.get(id)?.emit('typing', { chatId, userId, isTyping });
      });
  }

  private getParticipants(chatId: string): string[] {
    return chats.find(c => c.id === chatId)?.participantIds ?? [];
  }

  private broadcastExcept(excludeUserId: string, event: string, data: unknown): void {
    this.connectedUsers.forEach((socket, userId) => {
      if (userId !== excludeUserId) socket.emit(event, data);
    });
  }
}

// ─── App Module ───────────────────────────────────────────────────────────────

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController, ChatsController],
  providers: [MessagesGateway],
})
class AppModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({ origin: '*' });
  await app.listen(3000);
  console.log('Mock API running on http://localhost:3000');
}

bootstrap();
