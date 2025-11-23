import { Component } from '@angular/core';
import { GameService } from '../../services/store/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WsService } from '../../services/ws.service';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule, CardLayoutComponent, RouterLink],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  roomCode = '';
  roomName = '';
  playerName = '';
  rooms: any[] = [];

  constructor(
    private ws: WsService,
    public game: GameService,
    private _userService: UserService,
    private _router: Router,
    private _location: Location,
  ) {}

  ngOnInit() {
    this.initWs()
  }

  private initWs() {
    this.ws.connect();

    this.ws.onReady().subscribe(() => {
      this.ws.send({ type: 'get-rooms' });
    });

    this.ws.onMessage().subscribe((msg) => {
      if (msg.type === 'rooms-updated') {
        this.rooms = msg.rooms;
      }
    });
  }

  createRoom(isPrivate: boolean) {
    const user = this._userService.user();
    if (!user) return;
    this.game.createRoom({ name: 'Sala de ' + user.username, user, isPrivate });
  }

  joinRoom(id: string) {
    const user = this._userService.user();
    if (!user) return;
    this._router.navigate(['/sala', id]);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this._router.navigate(['/']);
    }
  }
}
