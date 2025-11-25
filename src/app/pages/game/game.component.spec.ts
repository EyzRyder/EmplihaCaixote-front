import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { GameComponent } from './game.component';
import { WsService } from '../../services/ws.service';
import { GameService } from '../../services/store/game.service';
import { UserService } from '../../services/user.service';

class MockWsService {
  message$ = new Subject<any>();
  onMessage() { return this.message$.asObservable(); }
  connect() {}
}

class MockGameService {
  room() { return null as any; }
}

class MockUserService {
  user() { return { id: 'p1', username: 'U1' } as any; }
}

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let ws: MockWsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent, RouterTestingModule],
      providers: [
        { provide: WsService, useClass: MockWsService },
        { provide: GameService, useClass: MockGameService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    ws = TestBed.inject(WsService) as any;
    fixture.detectChanges();
  });

  it('handles start-game message', () => {
    const board = Array.from({ length: 6 }, () => Array(7).fill(0));
    ws.message$.next({
      type: 'start-game',
      room: {
        id: 'room-1',
        board,
        players: [
          { id: 'p1', username: 'U1' },
          { id: 'p2', username: 'U2' },
        ],
        blockedColumns: [],
      },
      currentPlayerId: 'p1',
    });

    expect(component.gameState.gameStarted).toBeTrue();
    expect(component.gameState.roomId).toBe('room-1');
    expect(component.gameState.currentPlayerId).toBe('p1');
    expect(component.gameState.myId).toBe('p1');
  });

  it('handles turn-start message', () => {
    component.gameState.myId = 'p1';
    ws.message$.next({ type: 'turn-start', playerId: 'p1', timeLeft: 15 });
    expect(component.timerInfo.isMyTurn).toBeTrue();
    expect(component.timerInfo.myTimeLeft).toBe(15);
  });

  it('handles turn-timeout message', () => {
    component.gameState.myId = 'p1';
    component.timerInfo.isMyTurn = true;
    ws.message$.next({ type: 'turn-timeout', playerId: 'p1' });
    expect(component.timerInfo.isMyTurn).toBeFalse();
  });
});
