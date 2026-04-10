import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@api/controllers/user/services/user/user.service';
import { IUserDetails } from '@shared/interfaces/user-details.interface';
import { createDestroyer } from '@shared/utils/create-destroyer';
import { AuthStore } from '@store/auth/auth.store';
import { UserStore } from '@store/user/user.store';
import { catchError, EMPTY, map, switchMap, tap } from 'rxjs';

import { ERouterOutlet } from '../../internal-layout/enums/router-outlet.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly authStore = inject(AuthStore);
  private readonly destroyer = createDestroyer();

  protected readonly isLoading = signal(true);
  protected readonly userDetails = signal<IUserDetails | null>(null);

  protected readonly userId = toSignal(this.route.paramMap.pipe(map(params => params.get('id')!)));

  protected readonly isOwnProfile = computed(
    () => this.userId() === this.userStore.currentUser()?.userId,
  );

  protected readonly initials = computed(() => {
    const name = this.userDetails()?.userName ?? '';

    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  constructor() {
    toObservable(this.userId)
      .pipe(
        switchMap(userId => {
          if (!userId) {
            return EMPTY;
          }

          this.isLoading.set(true);

          return this.userService.getUserDetails(userId).pipe(
            tap(details => {
              this.userDetails.set(details);
              this.isLoading.set(false);
            }),
            catchError(() => {
              this.isLoading.set(false);

              return EMPTY;
            }),
          );
        }),
        this.destroyer(),
      )
      .subscribe();
  }

  protected close(): void {
    void this.router.navigate([{ outlets: { [ERouterOutlet.Right]: null } }]);
  }

  protected logout(): void {
    this.authStore.logout();
  }
}
