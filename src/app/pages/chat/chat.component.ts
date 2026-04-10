import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '@app/core/store/chat/chat.store';
import { UserStore } from '@app/core/store/user/user.store';
import { MessagesService } from '@app/pages/chat/services/messages/messages.service';
import { MessageStore } from '@app/pages/chat/store/message/message.store';
import { MessagesListComponent } from '@pages/chat/components/messages-list';
import { IDateDividerItem, TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { map } from 'rxjs';

import { ERouterOutlet } from '../../internal-layout/enums/router-outlet.enum';

@Component({
  selector: 'app-chat',
  imports: [MessagesListComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  providers: [MessagesService, MessageStore],
})
export class ChatComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageStore = inject(MessageStore);
  private readonly chatStore = inject(ChatStore);
  private readonly userStore = inject(UserStore);
  private readonly messagesService = inject(MessagesService);

  protected readonly chatId = toSignal(
    this.route.params.pipe(map((params): string => params['id'] as string)),
  );

  protected readonly activeChat = computed(() => {
    const id = this.chatId();

    return id ? this.chatStore.chats().find(c => c.id === id) : undefined;
  });

  private readonly messages = computed(() => {
    const id = this.chatId();

    return id ? (this.messageStore.messagesByChatId()[id] ?? []) : [];
  });

  protected readonly typingUsers = computed(() => {
    const id = this.chatId();

    if (!id) {
      return [];
    }

    const typingIds = this.messageStore.typingByChatId()[id] ?? [];

    return typingIds.filter(userId => userId !== this.userStore.currentUser()?.userId);
  });

  protected readonly messageText = signal('');
  protected readonly isAppend = signal(false);

  protected readonly messageItems = computed((): TMessageListItem[] => {
    const messages = this.messages();
    const items: TMessageListItem[] = [];

    let prevDayLabel = '';

    for (const message of messages) {
      const dayLabel = message.createdAt.toDateString();

      if (dayLabel !== prevDayLabel) {
        const divider: IDateDividerItem = {
          type: 'divider',
          id: `divider-${dayLabel}`,
          date: dayLabel,
        };

        items.push(divider);
        prevDayLabel = dayLabel;
      }
      items.push({ ...message, type: 'message' });
    }

    return items;
  });

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private isTyping = false;

  private prevChatId: string | null = null;
  private isInitialLoadPending = false;
  private prevItemsLength = 0;

  constructor() {
    effect(() => {
      const id = this.chatId();

      if (id) {
        this.messageStore.loadMessages(id);
      }
    });

    effect(() => {
      const chat = this.activeChat();

      if (chat && this.router.url.includes('(right:profile')) {
        void this.router.navigate([
          { outlets: { [ERouterOutlet.Right]: ['profile', chat.participant.userId] } },
        ]);
      }
    });

    effect(() => {
      const chatId = this.chatId() ?? null;
      const items = this.messageItems();
      const isChatChanged = chatId !== this.prevChatId;

      if (isChatChanged) {
        this.prevChatId = chatId;
        this.isInitialLoadPending = true;
        this.prevItemsLength = 0;
      }

      if (items.length === 0) {
        return;
      }

      if (this.isInitialLoadPending) {
        this.isInitialLoadPending = false;
        this.prevItemsLength = items.length;
        this.isAppend.set(false);
      } else if (items.length > this.prevItemsLength) {
        this.prevItemsLength = items.length;
        this.isAppend.set(true);
      }
    });

    this.messagesService.connect(this.messageStore);
  }

  protected onInput(event: Event): void {
    this.messageText.set((event.target as HTMLTextAreaElement).value);

    this.handleTyping();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const text = this.messageText().trim();
    const chatId = this.chatId();

    if (!text || !chatId) {
      return;
    }

    this.messagesService.emit('message:send', { chatId, text });
    this.messageText.set('');
    this.stopTyping();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit(event);
    }
  }

  private handleTyping(): void {
    const chatId = this.chatId();

    if (!chatId) {
      return;
    }

    if (!this.isTyping) {
      this.isTyping = true;
      this.messagesService.emit('typing:start', { chatId });
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  public ngOnDestroy(): void {
    this.stopTyping();
  }

  protected openParticipantProfile(userId: string): void {
    void this.router.navigate([{ outlets: { [ERouterOutlet.Right]: ['profile', userId] } }]);
  }

  private stopTyping(): void {
    const chatId = this.chatId();
    if (this.isTyping && chatId) {
      this.isTyping = false;
      this.messagesService.emit('typing:stop', { chatId });
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }
}
