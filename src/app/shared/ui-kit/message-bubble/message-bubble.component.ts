import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { UserStore } from '@app/core/store/user/user.store';
import { IMessage } from '@shared/interfaces/message.interface';

@Component({
  selector: 'ui-kit-message-bubble',
  imports: [DatePipe],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
})
export class MessageBubbleComponent {
  private readonly userStore = inject(UserStore);

  public readonly message = input.required<IMessage>();

  protected readonly isSent = computed(
    () => this.message().senderId === this.userStore.currentUser()?.userId,
  );
}
