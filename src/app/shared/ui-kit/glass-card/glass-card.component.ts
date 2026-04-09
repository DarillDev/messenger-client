import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-kit-glass-card',
  standalone: true,
  templateUrl: './glass-card.component.html',
  styleUrl: './glass-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlassCardComponent {}
