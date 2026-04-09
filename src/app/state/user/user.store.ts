import { computed } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { IUserDto } from '@shared/dtos/user-dto.interface';

type TUserState = {
  currentUser: IUserDto | null;
};

const initialState: TUserState = {
  currentUser: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withDevtools('user'),
  withState(initialState),
  withComputed(({ currentUser }) => ({
    userName: computed(() => currentUser()?.userName),
    isOnline: computed(() => currentUser()?.isOnline),
  })),
  withMethods(store => ({
    setUser(user: IUserDto): void {
      patchState(store, { currentUser: user });
    },
    clear(): void {
      patchState(store, { currentUser: null });
    },
  })),
);
