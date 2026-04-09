import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.full-width]': 'fullWidth()',
  },
})
export class ButtonComponent {
  public readonly variant = input<'primary' | 'secondary'>('primary');
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input(false);
  public readonly fullWidth = input(false);
}
