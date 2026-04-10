import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth/auth.guard';
import { guestGuard } from '@core/auth/guards/guest/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./internal-layout/internal-layout.component').then(m => m.InternalLayoutComponent),
    canActivate: [authGuard],
    loadChildren: () =>
      import('./internal-layout/internal-layout.routes').then(m => m.INTERNAL_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('@pages/login').then(m => m.LOGIN_ROUTES),
    canActivate: [guestGuard],
  },
  {
    path: 'error',
    loadComponent: () =>
      import('@pages/error-screen/error-screen.component').then(m => m.ErrorScreenComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
