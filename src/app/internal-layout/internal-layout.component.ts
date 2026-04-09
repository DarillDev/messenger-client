import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatStore } from '@store/chat/chat.store';
import { MessagesService } from '@pages/chat/services/messages/messages.service';
import { MessageStore } from '@pages/chat/store/message/message.store';

import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-internal-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './internal-layout.component.html',
  styleUrl: './internal-layout.component.scss',
  providers: [MessagesService, MessageStore],
})
export class InternalLayoutComponent implements OnInit, OnDestroy {
  private readonly chatStore = inject(ChatStore);
  private readonly messagesService = inject(MessagesService);
  private readonly messageStore = inject(MessageStore);

  public ngOnInit(): void {
    this.chatStore.loadChats();
    this.messagesService.connect(this.messageStore);
  }

  public ngOnDestroy(): void {
    this.messagesService.disconnect();
  }
}
