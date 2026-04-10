import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessagesService } from '@pages/chat/services/messages/messages.service';
import { MessageStore } from '@pages/chat/store/message/message.store';
import { ChatStore } from '@store/chat/chat.store';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ERouterOutlet } from './enums/router-outlet.enum';

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

  protected readonly routerOutletEnum = ERouterOutlet;
  protected readonly leftOutletActive = signal(false);
  protected readonly rightPanelActive = signal(false);

  public ngOnInit(): void {
    this.chatStore.loadChats();
    this.messagesService.connect(this.messageStore);
  }

  public ngOnDestroy(): void {
    this.messagesService.disconnect();
  }

  protected onLeftActivate(): void {
    this.leftOutletActive.set(true);
  }

  protected onLeftDeactivate(): void {
    this.leftOutletActive.set(false);
  }

  protected onRightActivate(): void {
    this.rightPanelActive.set(true);
  }

  protected onRightDeactivate(): void {
    this.rightPanelActive.set(false);
  }
}
