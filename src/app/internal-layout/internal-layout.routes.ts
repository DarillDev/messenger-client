import { Routes } from '@angular/router';
import { ChatComponent } from '@pages/chat/chat.component';
import { NoChatComponent } from '@pages/no-chat/no-chat.component';

export const internalRoutes: Routes = [
  {
    // Eagerly loaded: these are the primary screens rendered immediately
    // with the internal layout — no lazy-load delay on first open.
    path: '',
    component: NoChatComponent,
  },
  {
    path: 'chat/:id',
    component: ChatComponent,
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@pages/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@pages/settings/settings.component').then(m => m.SettingsComponent),
  },
];
