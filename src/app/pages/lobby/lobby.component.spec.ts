import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { LobbyComponent } from './lobby.component';
import { WsService } from '../../services/ws.service';
import { GameService } from '../../services/store/game.service';
import { UserService } from '../../services/user.service';

class MockWsService {
  message$ = new Subject<any>();
  onMessage() { return this.message$.asObservable(); }
  connect() {}
  isOpen() { return true; }
  onOpen() { return new Subject<void>().asObservable(); }
}

class MockGameService { room = () => null as any; }

class MockUserService { user() { return { id: 'p1', username: 'U1' } as any; } }

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let ws: MockWsService;
  let router: Router;
  const params$ = new Subject<any>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbyComponent, RouterTestingModule],
      providers: [
        { provide: WsService, useClass: MockWsService },
        { provide: GameService, useClass: MockGameService },
        { provide: UserService, useClass: MockUserService },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
        { provide: Location, useValue: { back: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    ws = TestBed.inject(WsService) as any;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    params$.next({ id: 'room-1' });
    fixture.detectChanges();
  });

  it('navega para /game ao receber start-game', () => {
    ws.message$.next({ type: 'start-game', room: { id: 'room-1' } });
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });
});
