import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { ChatService } from '@api/controllers/chat/services/chat/chat.service';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IChat } from '@shared/interfaces/chat.interface';
import { IMessage } from '@shared/interfaces/message.interface';
import { IUser } from '@shared/interfaces/user.interface';
import { createDestroyer } from '@shared/utils/create-destroyer';

type TChatState = {
  chats: IChat[];
  isLoading: boolean;
};

const initialState: TChatState = {
  chats: [],
  isLoading: false,
};

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withDevtools('chat'),
  withState(initialState),
  withMethods(store => {
    const chatService = inject(ChatService);
    const destroyer = createDestroyer();

    return {
      loadChats(): void {
        patchState(store, { isLoading: true });

        chatService
          .getChats()
          .pipe(destroyer())
          .subscribe({
            next: chats => {
              patchState(store, { chats, isLoading: false });
            },
            error: () => {
              patchState(store, { isLoading: false });
            },
          });
      },

      updateLastMessage(message: IMessage): void {
        patchState(store, state => ({
          chats: state.chats.map(chat =>
            chat.id === message.chatId
              ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
              : chat,
          ),
        }));
      },

      updateOnlineStatus(userId: string, isOnline: boolean): void {
        patchState(store, state => ({
          chats: state.chats.map(chat =>
            chat.participant.userId === userId
              ? { ...chat, participant: { ...chat.participant, isOnline } as IUser }
              : chat,
          ),
        }));
      },
    };
  }),
);
