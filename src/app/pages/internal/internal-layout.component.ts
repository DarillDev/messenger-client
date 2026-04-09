import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from '@core/socket/services/socket/socket.service';
import { ChatStore } from '@store/chat/chat.store';

import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-internal-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './internal-layout.component.html',
  styleUrl: './internal-layout.component.scss',
})
export class InternalLayoutComponent implements OnInit, OnDestroy {
  private readonly chatStore = inject(ChatStore);
  private readonly socketService = inject(SocketService);

  public ngOnInit(): void {
    this.chatStore.loadChats();
    this.socketService.connect();
  }

  public ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
