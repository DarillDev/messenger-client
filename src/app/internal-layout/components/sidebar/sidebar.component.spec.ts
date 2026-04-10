import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { IChatDto } from '@core/api/controllers/chat/dtos/chat-dto.interface';
import { APPLICATION_ENVIRONMENT } from '@core/environment/application-environment.token';
import { ChatStore } from '@store/chat/chat.store';

import { ChatListComponent } from '../chat-list';
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
        { provide: APPLICATION_ENVIRONMENT, useValue: { apiUrl: '' } },
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

    it('should render app-chat-list', () => {
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(ChatListComponent))).toBeTruthy();
    });
  });

  describe('Model', () => {
    it('should pass all chats to ChatListComponent when search is empty', () => {
      chatStore.loadChats();
      httpTesting.expectOne('/api/chats').flush([
        makeChat('c1', 'Alex', 'u2'),
        makeChat('c2', 'Maria', 'u3'),
      ]);
      fixture.detectChanges();

      const chatList = fixture.debugElement.query(By.directive(ChatListComponent));
      const chatListComponent = chatList.componentInstance as ChatListComponent;

      expect(chatListComponent.chats()).toHaveLength(2);
    });

    it('should pass filtered chats to ChatListComponent when search query is set', () => {
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

      const chatList = fixture.debugElement.query(By.directive(ChatListComponent));
      const chatListComponent = chatList.componentInstance as ChatListComponent;

      expect(chatListComponent.chats()).toHaveLength(1);
      expect(chatListComponent.chats()[0].participant.userName).toBe('Alex');
    });

    it('should pass empty chats array to ChatListComponent when no chats match query', () => {
      chatStore.loadChats();
      httpTesting.expectOne('/api/chats').flush([makeChat('c1', 'Alex', 'u2')]);
      fixture.detectChanges();

      const searchInput = fixture.nativeElement.querySelector(
        '[data-testid="search-input"]',
      ) as HTMLInputElement;
      searchInput.value = 'zzz';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const chatList = fixture.debugElement.query(By.directive(ChatListComponent));
      const chatListComponent = chatList.componentInstance as ChatListComponent;

      expect(chatListComponent.chats()).toHaveLength(0);
    });
  });
});
