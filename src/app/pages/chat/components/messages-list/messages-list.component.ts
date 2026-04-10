import {
  CdkVirtualScrollViewport,
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import {
  afterNextRender,
  Component,
  effect,
  inject,
  Injector,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { DateDividerComponent } from '@shared/ui-kit/date-divider';
import { MessageBubbleComponent } from '@shared/ui-kit/message-bubble';

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
  public readonly isAppend = input.required<boolean>();
  public readonly typingUsers = input<string[]>([]);

  private readonly viewport = viewChild.required(CdkVirtualScrollViewport);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const items = this.items();

      if (items.length === 0) {
        return;
      }

      const isAppend = untracked(() => this.isAppend());
      const behavior = isAppend ? 'smooth' : 'instant';

      afterNextRender(
        () => this.viewport().scrollToIndex(this.items().length - 1, behavior),
        { injector: this.injector },
      );
    });
  }

  protected trackItem(_index: number, item: TMessageListItem): string {
    return item.id;
  }
}
