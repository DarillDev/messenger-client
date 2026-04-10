import { Component, effect, input, viewChild } from '@angular/core';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { DateDividerComponent } from '@shared/ui-kit/date-divider';
import { MessageBubbleComponent } from '@shared/ui-kit/message-bubble';

@Component({
  selector: 'app-messages-list',
  imports: [ScrollingModule, DateDividerComponent, MessageBubbleComponent],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
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
