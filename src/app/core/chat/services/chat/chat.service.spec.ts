import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IChatDto } from '@shared/dtos/chat-dto.interface';
import { IMessageDto } from '@shared/dtos/message-dto.interface';

import { ChatService } from './chat.service';

const mockMessage: IMessageDto = {
  id: 'msg-1',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello',
  createdAt: '2026-04-10T10:00:00.000Z',
};

const mockChat: IChatDto = {
  id: 'c1',
  participant: { userId: 'u2', userName: 'Alex', isOnline: true },
  lastMessage: mockMessage,
  updatedAt: '2026-04-10T10:00:00.000Z',
  unreadCount: 0,
};

describe('ChatService', () => {
  let service: ChatService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ChatService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('getChats', () => {
    it('should GET /api/chats and return chat list', () => {
      let result: IChatDto[] | undefined;

      service.getChats().subscribe(chats => (result = chats));

      const request = httpTesting.expectOne('/api/chats');
      expect(request.request.method).toBe('GET');
      request.flush([mockChat]);

      expect(result).toEqual([mockChat]);
    });
  });

  describe('getMessages', () => {
    it('should GET /api/chats/:id/messages and return messages', () => {
      let result: IMessageDto[] | undefined;

      service.getMessages('c1').subscribe(messages => (result = messages));

      const request = httpTesting.expectOne('/api/chats/c1/messages');
      expect(request.request.method).toBe('GET');
      request.flush([mockMessage]);

      expect(result).toEqual([mockMessage]);
    });
  });
});
