import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '@pages/chat/services/messages/messages.service';
import { MessageStore } from '@pages/chat/store/message/message.store';
import { IMessage } from '@shared/interfaces/message.interface';
import { DateDividerComponent } from '@shared/ui-kit/date-divider';
import { MessageBubbleComponent } from '@shared/ui-kit/message-bubble';
import { ChatStore } from '@store/chat/chat.store';
import { UserStore } from '@store/user/user.store';
import { map } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [MessageBubbleComponent, DateDividerComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly messageStore = inject(MessageStore);
  private readonly chatStore = inject(ChatStore);
  private readonly userStore = inject(UserStore);
  private readonly messagesService = inject(MessagesService);

  private readonly messagesEndRef = viewChild<ElementRef<HTMLDivElement>>('messagesEnd');

  protected readonly chatId = toSignal(
    this.route.params.pipe(map((params): string => params['id'] as string)),
  );

  protected readonly activeChat = computed(() => {
    const id = this.chatId();

    return id ? this.chatStore.chats().find(c => c.id === id) : undefined;
  });

  protected readonly messages = computed(() => {
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

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private isTyping = false;

  constructor() {
    effect(() => {
      const id = this.chatId();

      if (id) {
        this.messageStore.loadMessages(id);
      }
    });

    effect(() => {
      this.messages();

      queueMicrotask(() => {
        this.messagesEndRef()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      });
    });
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

  protected getDayLabel(date: Date): string {
    return date.toDateString();
  }

  protected getPrevMessage(index: number): IMessage | undefined {
    return index > 0 ? this.messages()[index - 1] : undefined;
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
