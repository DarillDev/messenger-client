import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth/auth.guard';
import { guestGuard } from '@core/auth/guards/guest/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('@pages/internal/internal-layout.component').then(m => m.InternalLayoutComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
