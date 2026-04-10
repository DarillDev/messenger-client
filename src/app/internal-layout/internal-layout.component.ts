import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatStore } from '@app/core/store/chat/chat.store';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ERouterOutlet } from './enums/router-outlet.enum';

@Component({
  selector: 'app-internal-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './internal-layout.component.html',
  styleUrl: './internal-layout.component.scss',
  host: {
    '[class.right-panel-open]': 'isRightPanelActive()',
  },
})
export class InternalLayoutComponent {
  private readonly chatStore = inject(ChatStore);

  protected readonly isLeftOutletActive = signal(false);
  protected readonly isRightPanelActive = signal(false);

  protected readonly routerOutletEnum = ERouterOutlet;

  constructor() {
    this.chatStore.loadChats();
  }

  protected onLeftActivate(): void {
    this.isLeftOutletActive.set(true);
  }

  protected onLeftDeactivate(): void {
    this.isLeftOutletActive.set(false);
  }

  protected onRightActivate(): void {
    this.isRightPanelActive.set(true);
  }

  protected onRightDeactivate(): void {
    this.isRightPanelActive.set(false);
  }
}
