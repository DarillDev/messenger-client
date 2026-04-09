import { Component, input } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IChat } from '@shared/interfaces/chat.interface';
import { ChatItemComponent } from '@shared/ui-kit/chat-item';

@Component({
  selector: 'app-chat-list',
  imports: [ScrollingModule, ChatItemComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {
  public readonly chats = input.required<IChat[]>();
}
