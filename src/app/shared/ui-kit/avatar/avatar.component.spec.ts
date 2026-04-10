import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;

  function createComponent(userName: string, userId: string, isOnline = false, unreadCount = 0): void {
    fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput('userName', userName);
    fixture.componentRef.setInput('userId', userId);
    fixture.componentRef.setInput('isOnline', isOnline);
    fixture.componentRef.setInput('unreadCount', unreadCount);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();
  });

  it('should display first letter of userName as initial', () => {
    createComponent('Stepan', 'u1');

    const text = fixture.nativeElement.textContent.trim();

    expect(text).toContain('S');
  });

  it('should apply color class based on userId digits', () => {
    createComponent('Alex', 'u2');

    const avatar = fixture.nativeElement.querySelector('.avatar');

    expect(avatar.classList.contains('av-2')).toBe(true);
  });

  it('should fallback to av-1 when userId has no digits', () => {
    createComponent('Alex', 'user');

    const avatar = fixture.nativeElement.querySelector('.avatar');

    expect(avatar.classList.contains('av-1')).toBe(true);
  });

  it('should show online dot when isOnline is true', () => {
    createComponent('Alex', 'u1', true);

    const dot = fixture.nativeElement.querySelector('[data-testid="online-indicator"]');

    expect(dot).toBeTruthy();
  });

  it('should not show online dot when isOnline is false', () => {
    createComponent('Alex', 'u1', false);

    const dot = fixture.nativeElement.querySelector('[data-testid="online-indicator"]');

    expect(dot).toBeNull();
  });

  it('should show badge when unreadCount is greater than 0', () => {
    createComponent('Alex', 'u1', false, 3);

    const badge = fixture.nativeElement.querySelector('[data-testid="unread-badge"]');

    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('3');
  });

  it('should not show badge when unreadCount is 0', () => {
    createComponent('Alex', 'u1', false, 0);

    const badge = fixture.nativeElement.querySelector('[data-testid="unread-badge"]');

    expect(badge).toBeNull();
  });

  it('should apply has-badge class to avatar when unreadCount is greater than 0', () => {
    createComponent('Alex', 'u1', false, 5);

    const avatar = fixture.nativeElement.querySelector('.avatar');

    expect(avatar.classList.contains('has-badge')).toBe(true);
  });

  it('should apply has-online class to avatar when isOnline is true', () => {
    createComponent('Alex', 'u1', true);

    const avatar = fixture.nativeElement.querySelector('.avatar');

    expect(avatar.classList.contains('has-online')).toBe(true);
  });
});
