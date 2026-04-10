import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IChat } from '@shared/interfaces/chat.interface';

import { ChatListComponent } from './chat-list.component';

const makeChat = (id: string): IChat => ({
  id,
  participant: { userId: `u${id}`, userName: `User ${id}`, isOnline: false },
  lastMessage: {
    id: `m${id}`,
    chatId: id,
    senderId: `u${id}`,
    text: 'Hello',
    createdAt: new Date('2026-04-10T10:00:00Z'),
  },
  updatedAt: new Date('2026-04-10T10:00:00Z'),
  unreadCount: 0,
});

describe('ChatListComponent', () => {
  let fixture: ComponentFixture<ChatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatListComponent, ScrollingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatListComponent);
    fixture.nativeElement.style.height = '500px';
    const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
    if (viewport) viewport.style.height = '500px';
  });

  describe('View', () => {
    it('should render chat items for each chat', async () => {
      fixture.componentRef.setInput('chats', [makeChat('1'), makeChat('2'), makeChat('3')]);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('ui-kit-chat-item');

      expect(items.length).toBe(3);
    });

    it('should show no-results message when chats is empty', () => {
      fixture.componentRef.setInput('chats', []);
      fixture.detectChanges();

      const noResults = fixture.nativeElement.querySelector('[data-testid="no-results"]');

      expect(noResults).toBeTruthy();
      expect(noResults.textContent.trim()).toBe('Чаты не найдены');
    });

    it('should not show no-results message when chats exist', async () => {
      fixture.componentRef.setInput('chats', [makeChat('1')]);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="no-results"]')).toBeFalsy();
    });
  });
});
