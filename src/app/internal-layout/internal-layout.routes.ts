import { Routes } from '@angular/router';
import { ChatComponent } from '@pages/chat/chat.component';
import { NoChatComponent } from '@pages/no-chat/no-chat.component';

import { ERouterOutlet } from './enums/router-outlet.enum';

// NoChatComponent, SidebarComponent and ChatComponent are loaded eagerly on purpose:
// InternalLayoutComponent is already a lazy chunk (loadComponent in app.routes.ts),
// so its children are isolated in that bundle automatically.
// An extra dynamic import inside a lazy chunk brings no benefit
// but adds an unnecessary network request on every chat navigation.
export const INTERNAL_ROUTES: Routes = [
  // Left outlet
  {
    path: 'settings',
    outlet: ERouterOutlet.Left,
    loadChildren: () => import('@pages/settings').then(m => m.SETTINGS_ROUTES),
  },

  // Primary outlet
  {
    path: '',
    component: NoChatComponent,
  },
  {
    path: 'chat/:id',
    component: ChatComponent,
  },

  // Right outlet
  {
    path: 'profile/:id',
    outlet: ERouterOutlet.Right,
    loadChildren: () => import('@pages/profile').then(m => m.PROFILE_ROUTES),
  },
];
