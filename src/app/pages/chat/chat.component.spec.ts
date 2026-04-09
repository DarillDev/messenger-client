import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { SocketService } from '@core/socket/services/socket/socket.service';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { ChatStore } from '@store/chat/chat.store';
import { MessageStore } from '@store/message/message.store';
import { UserStore } from '@store/user/user.store';
import { of } from 'rxjs';

import { ChatComponent } from './chat.component';

const mockMessages: IMessageDto[] = [
  { id: 'msg-1', chatId: 'c1', senderId: 'u2', text: 'Hi!', createdAt: '2026-04-10T10:00:00.000Z' },
  { id: 'msg-2', chatId: 'c1', senderId: 'u1', text: 'Hello!', createdAt: '2026-04-10T10:01:00.000Z' },
];

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let messageStore: InstanceType<typeof MessageStore>;

  const mockSocketService = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // jsdom does not implement scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        ChatStore,
        MessageStore,
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SocketService, useValue: mockSocketService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'c1' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    messageStore = TestBed.inject(MessageStore);

    // Pre-load messages so the component has data
    messageStore.addMessage('c1', mockMessages[0]);
    messageStore.addMessage('c1', mockMessages[1]);
  });

  describe('View', () => {
    it('should render message bubbles', () => {
      fixture.detectChanges();
      const bubbles = fixture.nativeElement.querySelectorAll('app-message-bubble');
      expect(bubbles).toHaveLength(2);
    });

    it('should render message input', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="message-input"]')).toBeTruthy();
    });

    it('should render send button', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="send-button"]')).toBeTruthy();
    });
  });

  describe('Events', () => {
    it('should emit message:send on form submit with text', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'Test message';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(mockSocketService.emit).toHaveBeenCalledWith('message:send', {
        chatId: 'c1',
        text: 'Test message',
      });
    });

    it('should clear input after sending', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'Test message';
      input.dispatchEvent(new Event('input'));

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(fixture.componentInstance['messageText']()).toBe('');
    });

    it('should not emit when message is empty', () => {
      fixture.detectChanges();
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      expect(mockSocketService.emit).not.toHaveBeenCalledWith('message:send', expect.anything());
    });

    it('should submit on Enter key without Shift', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'Enter message';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      input.dispatchEvent(enterEvent);

      expect(mockSocketService.emit).toHaveBeenCalledWith('message:send', {
        chatId: 'c1',
        text: 'Enter message',
      });
    });

    it('should not submit on Enter key with Shift', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'Shift enter message';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      input.dispatchEvent(shiftEnterEvent);

      expect(mockSocketService.emit).not.toHaveBeenCalledWith('message:send', expect.anything());
    });

    it('should emit typing:start when user types', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'typing...';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(mockSocketService.emit).toHaveBeenCalledWith('typing:start', { chatId: 'c1' });
    });

    it('should emit typing:stop after typing timer expires', () => {
      jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'typing...';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      jest.advanceTimersByTime(1000);

      expect(mockSocketService.emit).toHaveBeenCalledWith('typing:stop', { chatId: 'c1' });

      jest.useRealTimers();
    });
  });
});
