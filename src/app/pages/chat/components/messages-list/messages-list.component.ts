import { ScrollingModule, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { AutoSizeVirtualScrollStrategy } from '@angular/cdk-experimental/scrolling';
import { Component, effect, ElementRef, input, viewChild } from '@angular/core';
import { TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { DateDividerComponent } from '@shared/ui-kit/date-divider';
import { MessageBubbleComponent } from '@shared/ui-kit/message-bubble';

@Component({
  selector: 'app-messages-list',
  imports: [ScrollingModule, DateDividerComponent, MessageBubbleComponent],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (): AutoSizeVirtualScrollStrategy => new AutoSizeVirtualScrollStrategy(50, 250),
    },
  ],
})
export class MessagesListComponent {
  public readonly items = input.required<TMessageListItem[]>();
  public readonly typingUsers = input<string[]>([]);

  private readonly viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');

  constructor() {
    let prevLength = 0;

    effect(() => {
      const items = this.items();
      const isNewMessage = items.length > prevLength;
      prevLength = items.length;

      if (items.length === 0) {
        return;
      }

      const element = this.viewportRef().nativeElement;

      queueMicrotask(() => {
        element.scrollTo({ top: element.scrollHeight, behavior: isNewMessage ? 'smooth' : 'instant' });
      });
    });
  }

  protected trackItem(_index: number, item: TMessageListItem): string {
    return item.id;
  }
}
