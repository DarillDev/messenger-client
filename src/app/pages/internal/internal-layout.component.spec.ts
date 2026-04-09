import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { SocketService } from '@core/socket/services/socket/socket.service';
import { ChatStore } from '@state/chat/chat.store';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { InternalLayoutComponent } from './internal-layout.component';

// Stub for SidebarComponent to avoid needing all its dependencies
@Component({ selector: 'app-sidebar', standalone: true, template: '' })
class SidebarStubComponent {}

describe('InternalLayoutComponent', () => {
  let fixture: ComponentFixture<InternalLayoutComponent>;

  const mockSocketService = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalLayoutComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatStore,
        { provide: SocketService, useValue: mockSocketService },
      ],
    })
      .overrideComponent(InternalLayoutComponent, {
        remove: { imports: [SidebarComponent] },
        add: { imports: [SidebarStubComponent, RouterOutlet] },
      })
      .compileComponents();

    jest.clearAllMocks();
    fixture = TestBed.createComponent(InternalLayoutComponent);
  });

  describe('View', () => {
    it('should render sidebar', () => {
      fixture.detectChanges();
      const sidebar = fixture.nativeElement.querySelector('app-sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should render router-outlet', () => {
      fixture.detectChanges();
      const outlet = fixture.nativeElement.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });
  });

  describe('Events', () => {
    it('should call socketService.connect on init', () => {
      fixture.detectChanges();
      expect(mockSocketService.connect).toHaveBeenCalled();
    });

    it('should call socketService.disconnect on destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      expect(mockSocketService.disconnect).toHaveBeenCalled();
    });
  });
});
