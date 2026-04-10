import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormFieldComponent, UiKitPrefixDirective } from '@shared/ui-kit/form-field';
import { UiKitInputDirective } from '@shared/ui-kit/input';
import { ChatStore } from '@store/chat/chat.store';
import { UserStore } from '@store/user/user.store';

import { ERouterOutlet } from '../../enums/router-outlet.enum';
import { ChatListComponent } from '../chat-list';

@Component({
  selector: 'app-sidebar',
  imports: [ChatListComponent, FormFieldComponent, UiKitInputDirective, UiKitPrefixDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly chatStore = inject(ChatStore);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal('');

  protected readonly filteredChats = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const chats = this.chatStore.chats();

    if (!query) return chats;

    return chats.filter(chat => chat.participant.userName.toLowerCase().includes(query));
  });

  protected readonly currentUserInitials = computed(() => {
    const name = this.userStore.currentUser()?.userName ?? '';
    return name.charAt(0).toUpperCase();
  });

  protected readonly currentUserId = computed(() => this.userStore.currentUser()?.userId ?? '');

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected openOwnProfile(): void {
    void this.router.navigate([{ outlets: { [ERouterOutlet.Right]: ['profile', this.currentUserId()] } }]);
  }

  protected openSettings(): void {
    void this.router.navigate([{ outlets: { [ERouterOutlet.Left]: ['settings'] } }]);
  }
}
