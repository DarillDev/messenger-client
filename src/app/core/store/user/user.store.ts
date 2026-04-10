import { computed } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { IUser } from '@shared/interfaces/user.interface';

type TUserState = {
  currentUser: IUser | null;
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
    setUser(user: IUser): void {
      patchState(store, { currentUser: user });
    },
    clear(): void {
      patchState(store, { currentUser: null });
    },
  })),
);
