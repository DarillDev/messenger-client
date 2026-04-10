import {
  CdkVirtualScrollViewport,
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { Component, effect, input, viewChild } from '@angular/core';
import { TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { DateDividerComponent } from '@shared/ui-kit/date-divider';
import { MessageBubbleComponent } from '@shared/ui-kit/message-bubble';

// itemSize = 120px breakdown:
//   MessageBubble (3-line clamp): bubble padding 20px + 3×(14×1.55)=66px + group gap 3px + timestamp 17px = 106px
//   DateDivider:                  top/bottom padding 32px + span content 23px = 55px
//   Bottom spacing:               14px (baked into scroll-item padding-bottom)
//   Max = 106 + 14 = 120px  →  itemSize = 120
const ITEM_SIZE = 120;

@Component({
  selector: 'app-messages-list',
  imports: [ScrollingModule, DateDividerComponent, MessageBubbleComponent],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (): FixedSizeVirtualScrollStrategy =>
        new FixedSizeVirtualScrollStrategy(ITEM_SIZE, ITEM_SIZE * 2, ITEM_SIZE * 4),
    },
  ],
})
export class MessagesListComponent {
  public readonly items = input.required<TMessageListItem[]>();
  public readonly typingUsers = input<string[]>([]);

  private readonly viewport = viewChild.required(CdkVirtualScrollViewport);

  constructor() {
    let prevLength = 0;

    effect(() => {
      const items = this.items();
      const isNewMessage = items.length > prevLength;

      prevLength = items.length;

      if (items.length === 0) {
        return;
      }

      this.viewport().scrollToIndex(
        items.length - 1,
        isNewMessage ? 'smooth' : 'instant',
      );
    });
  }

  protected trackItem(_index: number, item: TMessageListItem): string {
    return item.id;
  }
}
