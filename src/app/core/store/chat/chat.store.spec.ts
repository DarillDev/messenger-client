import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IChatDto } from '@api/controllers/chat/dtos/chat-dto.interface';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { IChat } from '@shared/interfaces/chat.interface';
import { IMessage } from '@shared/interfaces/message.interface';

import { ChatStore } from './chat.store';

const mockMessageDto: IMessageDto = {
  id: 'msg-1',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello',
  createdAt: '2026-04-10T10:00:00.000Z',
};

const mockChatDto: IChatDto = {
  id: 'c1',
  participant: { userId: 'u2', userName: 'Alex', isOnline: true },
  lastMessage: mockMessageDto,
  updatedAt: '2026-04-10T10:00:00.000Z',
  unreadCount: 0,
};

const mockMessage: IMessage = {
  id: 'msg-1',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello',
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
};

const mockChat: IChat = {
  id: 'c1',
  participant: { userId: 'u2', userName: 'Alex', isOnline: true },
  lastMessage: mockMessage,
  updatedAt: new Date('2026-04-10T10:00:00.000Z'),
  unreadCount: 0,
};

describe('ChatStore', () => {
  let store: InstanceType<typeof ChatStore>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: '' } },
      ],
    });
    store = TestBed.inject(ChatStore);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('initial state', () => {
    it('should have empty chats list', () => {
      expect(store.chats()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('loadChats', () => {
    it('should load chats from API and update state', () => {
      store.loadChats();

      httpTesting.expectOne('/api/chats').flush([mockChatDto]);

      expect(store.chats()).toEqual([mockChat]);
      expect(store.isLoading()).toBe(false);
    });

    it('should set isLoading false on error', () => {
      store.loadChats();

      httpTesting
        .expectOne('/api/chats')
        .flush('error', { status: 500, statusText: 'Server Error' });

      expect(store.isLoading()).toBe(false);
      expect(store.chats()).toEqual([]);
    });
  });

  describe('updateLastMessage', () => {
    it('should update lastMessage for the matching chat', () => {
      store.loadChats();
      httpTesting.expectOne('/api/chats').flush([mockChatDto]);

      const newMessage: IMessage = {
        id: 'msg-2',
        chatId: 'c1',
        senderId: 'u1',
        text: 'Reply',
        createdAt: new Date('2026-04-10T10:01:00.000Z'),
      };

      store.updateLastMessage(newMessage);

      expect(store.chats()[0].lastMessage).toEqual(newMessage);
      expect(store.chats()[0].updatedAt).toBe(newMessage.createdAt);
    });
  });

  describe('updateOnlineStatus', () => {
    it('should update online status for the matching participant', () => {
      store.loadChats();
      httpTesting.expectOne('/api/chats').flush([mockChatDto]);

      store.updateOnlineStatus('u2', false);

      expect(store.chats()[0].participant.isOnline).toBe(false);
    });
  });
});
