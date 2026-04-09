import { Component, computed, inject, signal } from '@angular/core';
import { FormFieldComponent, UiKitPrefixDirective } from '@shared/ui-kit/form-field';
import { UiKitInputDirective } from '@shared/ui-kit/input';
import { ChatItemComponent } from '@shared/ui-kit/chat-item';
import { ChatStore } from '@store/chat/chat.store';


@Component({
  selector: 'app-sidebar',
  imports: [ChatItemComponent, FormFieldComponent, UiKitInputDirective, UiKitPrefixDirective],
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
