import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IMessage } from '@shared/interfaces/message.interface';
import { UserStore } from '@store/user/user.store';

import { MessageBubbleComponent } from './message-bubble.component';

const sentMessage: IMessage = {
  id: 'm1',
  chatId: 'c1',
  senderId: 'u1',
  text: 'Hello from me',
  createdAt: new Date('2026-04-10T10:00:00Z'),
};

const receivedMessage: IMessage = {
  id: 'm2',
  chatId: 'c1',
  senderId: 'u2',
  text: 'Hello from other',
  createdAt: new Date('2026-04-10T10:01:00Z'),
};

describe('MessageBubbleComponent', () => {
  let fixture: ComponentFixture<MessageBubbleComponent>;
  let userStore: InstanceType<typeof UserStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBubbleComponent],
      providers: [UserStore],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageBubbleComponent);
    userStore = TestBed.inject(UserStore);
    userStore.setUser({ userId: 'u1', userName: 'Stepan', isOnline: true });
  });

  describe('Model', () => {
    it('should identify sent message when senderId matches current user', () => {
      fixture.componentRef.setInput('message', sentMessage);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.msg-group').classList).toContain('sent');
    });

    it('should identify received message when senderId differs from current user', () => {
      fixture.componentRef.setInput('message', receivedMessage);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.msg-group').classList).toContain('received');
    });
  });

  describe('View', () => {
    it('should render message text', () => {
      fixture.componentRef.setInput('message', sentMessage);
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('[data-testid="message-text"]').textContent.trim(),
      ).toBe('Hello from me');
    });
  });
});
