import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FixedSizeVirtualScrollStrategy, ScrollingModule, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { IMessage } from '@shared/interfaces/message.interface';
import { IDateDividerItem, TMessageListItem } from '@pages/chat/types/message-list-item.type';
import { MessagesListComponent } from './messages-list.component';

const makeMessage = (id: string, date: string): IMessage & { type: 'message' } => ({
  type: 'message',
  id,
  chatId: 'c1',
  senderId: 'u1',
  text: `Message ${id}`,
  createdAt: new Date(date),
});

const makeDivider = (date: string): IDateDividerItem => ({
  type: 'divider',
  id: `divider-${date}`,
  date,
});

describe('MessagesListComponent', () => {
  let fixture: ComponentFixture<MessagesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesListComponent, ScrollingModule],
    })
      .overrideComponent(MessagesListComponent, {
        set: {
          providers: [
            {
              provide: VIRTUAL_SCROLL_STRATEGY,
              useFactory: () => new FixedSizeVirtualScrollStrategy(72, 300, 500),
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MessagesListComponent);
    fixture.nativeElement.style.height = '500px';
    const viewportEl = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
    if (viewportEl) viewportEl.style.height = '500px';
  });

  describe('View', () => {
    it('should render message bubbles and date dividers', async () => {
      const items: TMessageListItem[] = [
        makeDivider('Thu Apr 10 2026'),
        makeMessage('m1', '2026-04-10T10:00:00Z'),
        makeMessage('m2', '2026-04-10T11:00:00Z'),
      ];

      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const bubbles = fixture.nativeElement.querySelectorAll('ui-kit-message-bubble');
      const dividers = fixture.nativeElement.querySelectorAll('ui-kit-date-divider');

      expect(bubbles.length).toBe(2);
      expect(dividers.length).toBe(1);
    });

    it('should show typing indicator when typingUsers is not empty', () => {
      fixture.componentRef.setInput('items', []);
      fixture.componentRef.setInput('typingUsers', ['u2']);
      fixture.detectChanges();

      const indicator = fixture.nativeElement.querySelector('[data-testid="typing-indicator"]');

      expect(indicator).toBeTruthy();
    });

    it('should not show typing indicator when typingUsers is empty', () => {
      fixture.componentRef.setInput('items', []);
      fixture.componentRef.setInput('typingUsers', []);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="typing-indicator"]')).toBeFalsy();
    });
  });

  describe('Events', () => {
    it('should call scrollTo with smooth when new message arrives', async () => {
      const initial: TMessageListItem[] = [makeMessage('m1', '2026-04-10T10:00:00Z')];
      fixture.componentRef.setInput('items', initial);
      fixture.detectChanges();
      TestBed.flushEffects();
      await fixture.whenStable();

      const viewportEl = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
      const scrollToSpy = jest.spyOn(viewportEl, 'scrollTo');

      const updated: TMessageListItem[] = [...initial, makeMessage('m2', '2026-04-10T10:01:00Z')];
      fixture.componentRef.setInput('items', updated);
      fixture.detectChanges();
      TestBed.flushEffects();
      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(scrollToSpy).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' });
    });

    it('should not call scrollTo when items reset to empty', async () => {
      const initial: TMessageListItem[] = [
        makeMessage('m1', '2026-04-10T10:00:00Z'),
        makeMessage('m2', '2026-04-10T10:01:00Z'),
      ];
      fixture.componentRef.setInput('items', initial);
      fixture.detectChanges();
      TestBed.flushEffects();
      await fixture.whenStable();

      const viewportEl = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
      const scrollToSpy = jest.spyOn(viewportEl, 'scrollTo');

      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();
      TestBed.flushEffects();
      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });
});
