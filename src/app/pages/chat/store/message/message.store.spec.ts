import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IMessageDto } from '@core/api/controllers/chat/dtos/message-dto.interface';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { IMessage } from '@shared/interfaces/message.interface';

import { MessageStore } from './message.store';

const mockMessageDto: IMessageDto = {
  id: 'msg-1',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello',
  createdAt: '2026-04-10T10:00:00.000Z',
};

const mockMessage: IMessage = {
  id: 'msg-1',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello',
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
};

describe('MessageStore (pages/chat)', () => {
  let store: InstanceType<typeof MessageStore>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessageStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: '' } },
      ],
    });
    store = TestBed.inject(MessageStore);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('initial state', () => {
    it('should have empty messages and typing maps and isLoading false', () => {
      expect(store.messagesByChatId()).toEqual({});
      expect(store.typingByChatId()).toEqual({});
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('loadMessages', () => {
    it('should set isLoading true while loading and update messagesByChatId on success', () => {
      store.loadMessages('c1');

      expect(store.isLoading()).toBe(true);

      httpTesting.expectOne('/api/chats/c1/messages').flush([mockMessageDto]);

      expect(store.messagesByChatId()['c1']).toEqual([mockMessage]);
      expect(store.isLoading()).toBe(false);
    });

    it('should set isLoading false on error', () => {
      store.loadMessages('c1');

      httpTesting
        .expectOne('/api/chats/c1/messages')
        .flush('error', { status: 500, statusText: 'Server Error' });

      expect(store.isLoading()).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should create messages array when chatId is new', () => {
      store.addMessage('c2', mockMessage);

      expect(store.messagesByChatId()['c2']).toEqual([mockMessage]);
    });

    it('should append message when chatId already has messages', () => {
      store.loadMessages('c1');
      httpTesting.expectOne('/api/chats/c1/messages').flush([mockMessageDto]);

      const newMessage: IMessage = { ...mockMessage, id: 'msg-2', text: 'Reply' };
      store.addMessage('c1', newMessage);

      expect(store.messagesByChatId()['c1']).toHaveLength(2);
      expect(store.messagesByChatId()['c1'][1]).toEqual(newMessage);
    });
  });

  describe('setTyping', () => {
    it('should add userId when isTyping is true and chat has no existing typists', () => {
      store.setTyping('c1', 'u2', true);

      expect(store.typingByChatId()['c1']).toContain('u2');
    });

    it('should not duplicate userId when isTyping is true and userId already present', () => {
      store.setTyping('c1', 'u2', true);
      store.setTyping('c1', 'u2', true);

      expect(store.typingByChatId()['c1'].filter((id: string) => id === 'u2')).toHaveLength(1);
    });

    it('should remove userId when isTyping is false', () => {
      store.setTyping('c1', 'u2', true);
      store.setTyping('c1', 'u2', false);

      expect(store.typingByChatId()['c1']).not.toContain('u2');
    });

    it('should handle setTyping false when userId is not in the list', () => {
      store.setTyping('c1', 'u2', false);

      expect(store.typingByChatId()['c1']).toEqual([]);
    });
  });
});
