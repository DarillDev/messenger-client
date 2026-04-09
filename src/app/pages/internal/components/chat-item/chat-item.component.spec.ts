import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IChatDto } from '@shared/dtos/chat-dto.interface';

import { ChatItemComponent } from './chat-item.component';

const mockChat: IChatDto = {
  id: 'c1',
  participant: { userId: 'u2', userName: 'Alex', isOnline: true },
  lastMessage: {
    id: 'msg-1',
    chatId: 'c1',
    senderId: 'u2',
    text: 'Hello',
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  updatedAt: '2026-04-10T10:00:00.000Z',
  unreadCount: 2,
};

describe('ChatItemComponent', () => {
  let fixture: ComponentFixture<ChatItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatItemComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatItemComponent);
    fixture.componentRef.setInput('chat', mockChat);
    fixture.detectChanges();
  });

  describe('View', () => {
    it('should render participant name', () => {
      const name = fixture.nativeElement.querySelector('[data-testid="chat-name"]');
      expect(name.textContent.trim()).toBe('Alex');
    });

    it('should render last message preview', () => {
      const preview = fixture.nativeElement.querySelector('[data-testid="chat-preview"]');
      expect(preview.textContent.trim()).toBe('Hello');
    });

    it('should show unread badge when unreadCount > 0', () => {
      const badge = fixture.nativeElement.querySelector('[data-testid="unread-badge"]');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('2');
    });

    it('should not show unread badge when unreadCount is 0', () => {
      fixture.componentRef.setInput('chat', { ...mockChat, unreadCount: 0 });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="unread-badge"]')).toBeFalsy();
    });

    it('should show online indicator when participant is online', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="online-indicator"]')).toBeTruthy();
    });

    it('should not show online indicator when participant is offline', () => {
      fixture.componentRef.setInput('chat', {
        ...mockChat,
        participant: { ...mockChat.participant, isOnline: false },
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="online-indicator"]')).toBeFalsy();
    });
  });
});
