import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IChatDto } from '@shared/dtos/chat-dto.interface';
import { ChatStore } from '@store/chat/chat.store';

import { SidebarComponent } from './sidebar.component';

const makeChat = (id: string, name: string, userId: string): IChatDto => ({
  id,
  participant: { userId, userName: name, isOnline: false },
  lastMessage: {
    id: `msg-${id}`,
    chatId: id,
    senderId: 'u1',
    text: 'Hi',
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  updatedAt: '2026-04-10T10:00:00.000Z',
  unreadCount: 0,
});

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let chatStore: InstanceType<typeof ChatStore>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        ChatStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    chatStore = TestBed.inject(ChatStore);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SidebarComponent);
  });

  afterEach(() => httpTesting.verify());

  describe('View', () => {
    it('should render search input', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="search-input"]')).toBeTruthy();
    });
  });

  describe('Model', () => {
    it('should show all chats when search is empty', () => {
      chatStore.loadChats();
      httpTesting.expectOne('/api/chats').flush([
        makeChat('c1', 'Alex', 'u2'),
        makeChat('c2', 'Maria', 'u3'),
      ]);
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('app-chat-item');
      expect(items).toHaveLength(2);
    });

    it('should filter chats by search query', () => {
      chatStore.loadChats();
      httpTesting.expectOne('/api/chats').flush([
        makeChat('c1', 'Alex', 'u2'),
        makeChat('c2', 'Maria', 'u3'),
      ]);
      fixture.detectChanges();

      const searchInput = fixture.nativeElement.querySelector(
        '[data-testid="search-input"]',
      ) as HTMLInputElement;
      searchInput.value = 'al';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-chat-item')).toHaveLength(1);
    });

    it('should show no-results message when no chats match', () => {
      chatStore.loadChats();
      httpTesting.expectOne('/api/chats').flush([makeChat('c1', 'Alex', 'u2')]);
      fixture.detectChanges();

      const searchInput = fixture.nativeElement.querySelector(
        '[data-testid="search-input"]',
      ) as HTMLInputElement;
      searchInput.value = 'zzz';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.no-results')).toBeTruthy();
    });
  });
});
