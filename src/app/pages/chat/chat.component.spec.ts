import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { ERouterOutlet } from '@app/internal-layout/enums/router-outlet.enum';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { MessagesListComponent } from '@pages/chat/components/messages-list';
import { MessagesService } from '@pages/chat/services/messages/messages.service';
import { MessageStore } from '@pages/chat/store/message/message.store';
import { TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { IChat } from '@shared/interfaces/chat.interface';
import { IMessage } from '@shared/interfaces/message.interface';
import { ChatStore } from '@store/chat/chat.store';
import { UserStore } from '@store/user/user.store';
import { of } from 'rxjs';

import { ChatComponent } from './chat.component';

@Component({
  selector: 'app-messages-list',
  template: '',
})
class MessagesListStubComponent {
  public readonly items = input.required<TMessageListItem[]>();
  public readonly typingUsers = input<string[]>([]);
}

const mockMessages: IMessage[] = [
  { id: 'msg-1', chatId: 'c1', senderId: 'u2', text: 'Hi!', createdAt: new Date('2026-04-10T10:00:00.000Z') },
  { id: 'msg-2', chatId: 'c1', senderId: 'u1', text: 'Hello!', createdAt: new Date('2026-04-10T10:01:00.000Z') },
];

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let messageStore: InstanceType<typeof MessageStore>;

  const mockMessagesService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        ChatStore,
        MessageStore,
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: '' } },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'c1' }) } },
      ],
    })
      .overrideComponent(ChatComponent, {
        remove: { imports: [MessagesListComponent] },
        add: { imports: [MessagesListStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    messageStore = TestBed.inject(MessageStore);

    // Pre-load messages so the component has data
    messageStore.addMessage('c1', mockMessages[0]);
    messageStore.addMessage('c1', mockMessages[1]);
  });

  describe('View', () => {
    it('should render messages list', () => {
      fixture.detectChanges();
      const messagesList = fixture.nativeElement.querySelector('app-messages-list');
      expect(messagesList).toBeTruthy();
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

      expect(mockMessagesService.emit).toHaveBeenCalledWith('message:send', {
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
      expect(mockMessagesService.emit).not.toHaveBeenCalledWith('message:send', expect.anything());
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

      expect(mockMessagesService.emit).toHaveBeenCalledWith('message:send', {
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

      expect(mockMessagesService.emit).not.toHaveBeenCalledWith('message:send', expect.anything());
    });

    it('should emit typing:start when user types', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        '[data-testid="message-input"]',
      ) as HTMLTextAreaElement;
      input.value = 'typing...';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(mockMessagesService.emit).toHaveBeenCalledWith('typing:start', { chatId: 'c1' });
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

      expect(mockMessagesService.emit).toHaveBeenCalledWith('typing:stop', { chatId: 'c1' });

      jest.useRealTimers();
    });

    it('should reset typing state when stopTyping is called while not typing', () => {
      jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
      fixture.detectChanges();

      // onSubmit calls stopTyping internally — without starting typing first
      // this exercises the !this.isTyping branch in stopTyping
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      expect(mockMessagesService.emit).not.toHaveBeenCalledWith('typing:stop', expect.anything());

      jest.useRealTimers();
    });

    it('should navigate to participant profile when right outlet is already open', () => {
      // Arrange
      const chatStore = TestBed.inject(ChatStore);
      const mockChat: IChat = {
        id: 'c1',
        participant: { userId: 'u2', userName: 'Bob', isOnline: true },
        lastMessage: mockMessages[0],
        updatedAt: new Date(),
        unreadCount: 0,
      };
      patchState(chatStore, { chats: [mockChat] });

      const router = TestBed.inject(Router);
      jest.spyOn(router, 'url', 'get').mockReturnValue('/chat/c1(right:profile/u99)');
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      // Act
      fixture.detectChanges();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith([
        { outlets: { [ERouterOutlet.Right]: ['profile', 'u2'] } },
      ]);
    });
  });
});

describe('ChatComponent (no chatId)', () => {
  let fixture: ComponentFixture<ChatComponent>;

  const mockMessagesServiceNoChat = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        ChatStore,
        MessageStore,
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: '' } },
        { provide: MessagesService, useValue: mockMessagesServiceNoChat },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
      ],
    })
      .overrideComponent(ChatComponent, {
        remove: { imports: [MessagesListComponent] },
        add: { imports: [MessagesListStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
  });

  it('should render without messages when chatId is absent', () => {
    fixture.detectChanges();

    const messagesList = fixture.nativeElement.querySelector('app-messages-list');

    expect(messagesList).toBeTruthy();
  });

  it('should not emit message:send when chatId is absent', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '[data-testid="message-input"]',
    ) as HTMLTextAreaElement;
    input.value = 'Hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(mockMessagesServiceNoChat.emit).not.toHaveBeenCalledWith('message:send', expect.anything());
  });

  it('should not emit typing:start when chatId is absent', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '[data-testid="message-input"]',
    ) as HTMLTextAreaElement;
    input.value = 'typing...';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(mockMessagesServiceNoChat.emit).not.toHaveBeenCalledWith('typing:start', expect.anything());
  });
});
