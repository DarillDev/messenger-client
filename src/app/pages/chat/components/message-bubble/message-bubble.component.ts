import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { IMessage } from '@shared/interfaces/message.interface';
import { UserStore } from '@store/user/user.store';

@Component({
  selector: 'app-message-bubble',
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
