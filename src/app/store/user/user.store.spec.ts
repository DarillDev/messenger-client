import { TestBed } from '@angular/core/testing';

import { UserStore } from './user.store';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserStore],
    });

    store = TestBed.inject(UserStore);
  });

  describe('initial state', () => {
    it('should have null currentUser by default', () => {
      expect(store.currentUser()).toBeNull();
    });
  });

  describe('computed', () => {
    it('should return undefined userName when no user', () => {
      expect(store.userName()).toBeUndefined();
    });

    it('should return userName from currentUser', () => {
      store.setUser({ userId: 'u1', userName: 'Stepan', isOnline: true });

      expect(store.userName()).toBe('Stepan');
    });

    it('should return undefined isOnline when no user', () => {
      expect(store.isOnline()).toBeUndefined();
    });

    it('should return isOnline from currentUser', () => {
      store.setUser({ userId: 'u1', userName: 'Stepan', isOnline: true });

      expect(store.isOnline()).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set currentUser', () => {
      const user = { userId: 'u1', userName: 'Stepan', isOnline: true };

      store.setUser(user);

      expect(store.currentUser()).toEqual(user);
    });
  });

  describe('clear', () => {
    it('should reset currentUser to null', () => {
      store.setUser({ userId: 'u1', userName: 'Stepan', isOnline: true });

      store.clear();

      expect(store.currentUser()).toBeNull();
    });
  });
});
