import { Routes } from '@angular/router';

export const internalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/no-chat/no-chat.component').then(m => m.NoChatComponent),
  },
  {
    path: 'chat/:id',
    loadComponent: () =>
      import('@pages/chat/chat.component').then(m => m.ChatComponent),
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
