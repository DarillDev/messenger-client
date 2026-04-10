import {
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { Component, input } from '@angular/core';
import { IChat } from '@shared/interfaces/chat.interface';
import { ChatItemComponent } from '@shared/ui-kit/chat-item';

// itemSize = 78px breakdown:
//   ChatItemComponent: avatar 46px + padding 12px×2 = 70px content
//   Bottom spacing:    8px (baked into scroll-item padding-bottom)
//   Total:             78px → itemSize = 78
const ITEM_SIZE = 78;

@Component({
  selector: 'app-chat-list',
  imports: [ScrollingModule, ChatItemComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (): FixedSizeVirtualScrollStrategy =>
        new FixedSizeVirtualScrollStrategy(ITEM_SIZE, ITEM_SIZE * 3, ITEM_SIZE * 6),
    },
  ],
})
export class ChatListComponent {
  public readonly chats = input.required<IChat[]>();
}
