import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { ChatService } from '@core/chat/services/chat/chat.service';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { createDestroyer } from '@shared/utils/create-destroyer';

type TMessageState = {
  messagesByChatId: Record<string, IMessageDto[]>;
  typingByChatId: Record<string, string[]>;
  isLoading: boolean;
};

const initialState: TMessageState = {
  messagesByChatId: {},
  typingByChatId: {},
  isLoading: false,
};

export const MessageStore = signalStore(
  { providedIn: 'root' },
  withDevtools('message'),
  withState(initialState),
  withMethods(store => {
    const chatService = inject(ChatService);
    const destroyer = createDestroyer();

    return {
      loadMessages(chatId: string): void {
        patchState(store, { isLoading: true });

        chatService
          .getMessages(chatId)
          .pipe(destroyer())
          .subscribe({
            next: messages => {
              patchState(store, state => ({
                messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
                isLoading: false,
              }));
            },
            error: () => {
              patchState(store, { isLoading: false });
            },
          });
      },

      addMessage(chatId: string, message: IMessageDto): void {
        patchState(store, state => {
          const existing = state.messagesByChatId[chatId] ?? [];
          return {
            messagesByChatId: { ...state.messagesByChatId, [chatId]: [...existing, message] },
          };
        });
      },

      setTyping(chatId: string, userId: string, isTyping: boolean): void {
        patchState(store, state => {
          const current = state.typingByChatId[chatId] ?? [];
          const updated = isTyping
            ? current.includes(userId)
              ? current
              : [...current, userId]
            : current.filter(id => id !== userId);

          return {
            typingByChatId: { ...state.typingByChatId, [chatId]: updated },
          };
        });
      },
    };
  }),
);
