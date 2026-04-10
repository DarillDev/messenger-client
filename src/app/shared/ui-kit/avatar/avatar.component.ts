import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-kit-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  public readonly userName = input.required<string>();
  public readonly userId = input.required<string>();
  public readonly isOnline = input<boolean>(false);
  public readonly unreadCount = input<number>(0);

  protected readonly colorClass = computed(() => {
    const digit = this.userId().replace(/\D/g, '');
    return `av-${digit || '1'}`;
  });

  protected readonly initial = computed(() => this.userName().charAt(0).toUpperCase());
}
