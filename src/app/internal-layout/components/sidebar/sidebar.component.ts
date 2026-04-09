import { Component, computed, inject, signal } from '@angular/core';
import { ChatStore } from '@store/chat/chat.store';

import { ChatItemComponent } from '@shared/ui-kit/chat-item';

@Component({
  selector: 'app-sidebar',
  imports: [ChatItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly chatStore = inject(ChatStore);

  protected readonly searchQuery = signal('');

  protected readonly filteredChats = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const chats = this.chatStore.chats();

    if (!query) return chats;

    return chats.filter(chat => chat.participant.userName.toLowerCase().includes(query));
  });

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
