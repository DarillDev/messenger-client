import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IMessageDto } from '@core/api/controllers/chat/dtos/message-dto.interface';
import { MessageMapper } from '@core/api/controllers/chat/mappers/message/message.mapper';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { ChatStore } from '@store/chat/chat.store';
import * as socketIoClient from 'socket.io-client';

import { MessagesService } from './messages.service';
import { MessageStore } from '../../store/message/message.store';

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

describe('MessagesService', () => {
  let service: MessagesService;
  let chatStore: InstanceType<typeof ChatStore>;
  let tokenStorage: TokenStorageService;

  const mockMessageStore = {
    addMessage: jest.fn(),
    setTyping: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (socketIoClient.io as jest.Mock).mockReturnValue(mockSocket);

    TestBed.configureTestingModule({
      providers: [
        MessagesService,
        MessageStore,
        ChatStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: 'http://localhost:3000' } },
      ],
    });

    service = TestBed.inject(MessagesService);
    chatStore = TestBed.inject(ChatStore);
    tokenStorage = TestBed.inject(TokenStorageService);

    jest.spyOn(tokenStorage, 'getAccessToken').mockReturnValue('test-token');
  });

  describe('connect', () => {
    it('should create socket with token from TokenStorageService', () => {
      const ioSpy = socketIoClient.io as jest.Mock;

      service.connect(mockMessageStore);

      expect(ioSpy).toHaveBeenCalledWith(
        'http://localhost:3000',
        expect.objectContaining({ auth: { token: 'test-token' } }),
      );
    });

    it('should use empty string as token when access token is null', () => {
      jest.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null);
      const ioSpy = socketIoClient.io as jest.Mock;

      service.connect(mockMessageStore);

      expect(ioSpy).toHaveBeenCalledWith(
        'http://localhost:3000',
        expect.objectContaining({ auth: { token: '' } }),
      );
    });

    it('should register event listeners', () => {
      service.connect(mockMessageStore);

      expect(mockSocket.on).toHaveBeenCalledWith('message:new', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('typing', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:online', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:offline', expect.any(Function));
    });
  });

  describe('event handlers', () => {
    it('should call messageStore.addMessage and chatStore.updateLastMessage on message:new', () => {
      const updateLastMessageSpy = jest.spyOn(chatStore, 'updateLastMessage');

      service.connect(mockMessageStore);

      const messageNewHandler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'message:new',
      )?.[1] as (data: { chatId: string; message: IMessageDto }) => void;

      const messageDto: IMessageDto = {
        id: 'msg-new',
        chatId: 'c1',
        senderId: 'u2',
        text: 'Hi!',
        createdAt: '2026-04-10T10:00:00.000Z',
      };

      const mappedMessage = MessageMapper.fromDto(messageDto);

      messageNewHandler({ chatId: 'c1', message: messageDto });

      expect(mockMessageStore.addMessage).toHaveBeenCalledWith('c1', mappedMessage);
      expect(updateLastMessageSpy).toHaveBeenCalledWith(mappedMessage);
    });

    it('should call messageStore.setTyping on typing event', () => {
      service.connect(mockMessageStore);

      const typingHandler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'typing',
      )?.[1] as (data: { chatId: string; userId: string; isTyping: boolean }) => void;

      typingHandler({ chatId: 'c1', userId: 'u2', isTyping: true });

      expect(mockMessageStore.setTyping).toHaveBeenCalledWith('c1', 'u2', true);
    });

    it('should call chatStore.updateOnlineStatus with true on user:online', () => {
      const spy = jest.spyOn(chatStore, 'updateOnlineStatus');

      service.connect(mockMessageStore);

      const handler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'user:online',
      )?.[1] as (data: { userId: string }) => void;

      handler({ userId: 'u2' });

      expect(spy).toHaveBeenCalledWith('u2', true);
    });

    it('should call chatStore.updateOnlineStatus with false on user:offline', () => {
      const spy = jest.spyOn(chatStore, 'updateOnlineStatus');

      service.connect(mockMessageStore);

      const handler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'user:offline',
      )?.[1] as (data: { userId: string }) => void;

      handler({ userId: 'u3' });

      expect(spy).toHaveBeenCalledWith('u3', false);
    });
  });

  describe('disconnect', () => {
    it('should call socket.disconnect and clear references', () => {
      service.connect(mockMessageStore);
      service.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should not throw when disconnect is called without prior connect', () => {
      expect(() => service.disconnect()).not.toThrow();
    });
  });

  describe('emit', () => {
    it('should forward event to socket when connected', () => {
      service.connect(mockMessageStore);
      service.emit('message:send', { chatId: 'c1', text: 'Hello' });

      expect(mockSocket.emit).toHaveBeenCalledWith('message:send', { chatId: 'c1', text: 'Hello' });
    });

    it('should not throw when emit is called without prior connect', () => {
      expect(() => service.emit('message:send', { chatId: 'c1', text: 'Hello' })).not.toThrow();
    });
  });
});
