import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-kit-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  public readonly userName = input.required<string>();
  public readonly userId = input.required<string>();
  public readonly isOnline = input<boolean>(false);

  protected get colorClass(): string {
    const digit = this.userId().replace(/\D/g, '');
    return `av-${digit || '1'}`;
  }

  protected get initial(): string {
    return this.userName().charAt(0).toUpperCase();
  }
}
