import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IChat } from '@shared/interfaces/chat.interface';

import { AvatarComponent } from '../avatar';

@Component({
  selector: 'ui-kit-chat-item',
  imports: [RouterLink, RouterLinkActive, DatePipe, AvatarComponent],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss',
})
export class ChatItemComponent {
  public readonly chat = input.required<IChat>();
}
