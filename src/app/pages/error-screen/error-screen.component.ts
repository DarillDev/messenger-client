import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-screen',
  templateUrl: './error-screen.component.html',
  styleUrl: './error-screen.component.scss',
})
export class ErrorScreenComponent {
  private readonly router = inject(Router);

  protected goHome(): void {
    void this.router.navigate(['/']);
  }
}
