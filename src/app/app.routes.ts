import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth/auth.guard';
import { guestGuard } from '@core/auth/guards/guest/guest.guard';

// Not lazy-loaded intentionally — ChatComponent is the primary view of the app
// and should be available immediately without a network round-trip.
import { ChatComponent } from '@pages/chat/chat.component';
import { EmptyStateComponent } from '@pages/internal/components/empty-state/empty-state.component';

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
    children: [
      { path: '', component: EmptyStateComponent },
      { path: 'chat/:id', component: ChatComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
