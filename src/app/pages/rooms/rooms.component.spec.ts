import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomsComponent } from './rooms.component';
import { WsService } from '../../services/ws.service';
import { GameService } from '../../services/store/game.service';
import { UserService } from '../../services/user.service';

class MockWsService {
  onMessage() { return { subscribe: () => {} } as any; }
  onOpen() { return { subscribe: () => {} } as any; }
  isOpen() { return false; }
  connect() {}
  send() {}
}

class MockGameService {
  room = () => null as any;
  createRoom() {}
  joinRoom() {}
}

class MockUserService { user() { return { id: 'p1', username: 'U1' } as any; } }

describe('RoomsComponent', () => {
  let component: RoomsComponent;
  let fixture: ComponentFixture<RoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: WsService, useClass: MockWsService },
        { provide: GameService, useClass: MockGameService },
        { provide: UserService, useClass: MockUserService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
