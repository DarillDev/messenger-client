import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TokenStorageService } from '@core/auth/services/token-storage/token-storage.service';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import * as socketIoClient from 'socket.io-client';
import { ChatStore } from '@state/chat/chat.store';
import { MessageStore } from '@state/message/message.store';

import { SocketService } from './socket.service';

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

describe('SocketService', () => {
  let service: SocketService;
  let chatStore: InstanceType<typeof ChatStore>;
  let messageStore: InstanceType<typeof MessageStore>;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    (socketIoClient.io as jest.Mock).mockReturnValue(mockSocket);

    TestBed.configureTestingModule({
      providers: [
        SocketService,
        ChatStore,
        MessageStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(SocketService);
    chatStore = TestBed.inject(ChatStore);
    messageStore = TestBed.inject(MessageStore);
    tokenStorage = TestBed.inject(TokenStorageService);

    jest.spyOn(tokenStorage, 'getAccessToken').mockReturnValue('test-token');
  });

  describe('connect', () => {
    it('should create socket with token from TokenStorageService', () => {
      const ioSpy = socketIoClient.io as jest.Mock;
      service.connect();
      expect(ioSpy).toHaveBeenCalledWith(
        'http://localhost:3000',
        expect.objectContaining({ auth: { token: 'test-token' } }),
      );
    });

    it('should register event listeners on connect', () => {
      service.connect();
      expect(mockSocket.on).toHaveBeenCalledWith('message:new', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('typing', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:online', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:offline', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('should call socket.disconnect', () => {
      service.connect();
      service.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should forward event to socket', () => {
      service.connect();
      service.emit('message:send', { chatId: 'c1', text: 'Hello' });
      expect(mockSocket.emit).toHaveBeenCalledWith('message:send', { chatId: 'c1', text: 'Hello' });
    });
  });

  describe('event handlers', () => {
    it('should call messageStore.addMessage and chatStore.updateLastMessage on message:new', () => {
      const addMessageSpy = jest.spyOn(messageStore, 'addMessage');
      const updateLastMessageSpy = jest.spyOn(chatStore, 'updateLastMessage');

      service.connect();

      const messageNewHandler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'message:new',
      )?.[1] as (data: { chatId: string; message: IMessageDto }) => void;

      const message: IMessageDto = {
        id: 'msg-new',
        chatId: 'c1',
        senderId: 'u2',
        text: 'Hi!',
        createdAt: '2026-04-10T10:00:00.000Z',
      };

      messageNewHandler({ chatId: 'c1', message });

      expect(addMessageSpy).toHaveBeenCalledWith('c1', message);
      expect(updateLastMessageSpy).toHaveBeenCalledWith(message);
    });

    it('should call chatStore.updateOnlineStatus on user:online', () => {
      const spy = jest.spyOn(chatStore, 'updateOnlineStatus');
      service.connect();
      const handler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'user:online',
      )?.[1] as (data: { userId: string }) => void;
      handler({ userId: 'u2' });
      expect(spy).toHaveBeenCalledWith('u2', true);
    });

    it('should call chatStore.updateOnlineStatus on user:offline', () => {
      const spy = jest.spyOn(chatStore, 'updateOnlineStatus');
      service.connect();
      const handler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'user:offline',
      )?.[1] as (data: { userId: string }) => void;
      handler({ userId: 'u3' });
      expect(spy).toHaveBeenCalledWith('u3', false);
    });

    it('should call messageStore.setTyping on typing event', () => {
      const spy = jest.spyOn(messageStore, 'setTyping');
      service.connect();
      const handler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === 'typing',
      )?.[1] as (data: { chatId: string; userId: string; isTyping: boolean }) => void;
      handler({ chatId: 'c1', userId: 'u2', isTyping: true });
      expect(spy).toHaveBeenCalledWith('c1', 'u2', true);
    });
  });
});
