import {  Component, computed, signal } from '@angular/core';
import { GameService } from '../../services/store/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WsService } from '../../services/ws.service';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';
import { UserService } from '../../services/user.service';

interface RoomInfo {
  id: string;
  name: string;
  isPrivate: boolean;
  players: { id: string; username: string }[];
  maxPlayers: number
  ready: Record<string, boolean>;
  board: number[][]; // connect 4 6x7
  turn: number; // index do jogador (0 ou 1)
  gameStarted: boolean;

}

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

  private _rooms = signal<RoomInfo[]>([]);
  rooms = computed(() => this._rooms());

  constructor(
    private ws: WsService,
    public game: GameService,
    private userService: UserService,
    private router: Router,
    private location: Location,
  ) {
    this.ws.connect();

    if (this.ws.isOpen()) {
      this.ws.send({ type: 'get-rooms' });
      return;
    }

    this.ws.onOpen().subscribe(() => {
      this.ws.send({ type: 'get-rooms' });
    });

   }

  ngOnInit() {
    this.initWebSocket();
  }

  private initWebSocket() {

    this.ws.onMessage().subscribe((msg: any) => {
      // console.log(msg);
        switch (msg.type) {
          case 'rooms-updated':
            this._rooms.set(msg.rooms);
            console.log(msg);
            for(const room of this.rooms()){
              if(room.players.find(p=>p.id==this.userService.user()?.id)){
                this.router.navigate(['/sala', room.id]);
              }
            }

            break;
        }
    });
  }
  // ---------------------------------------------------------------------------
  // Ações
  // ---------------------------------------------------------------------------
  createRoom(isPrivate: boolean) {
    const user = this.userService.user();
    if (!user) return;

    const autoName = `Sala de ${user.username}`;
    this.game.createRoom({ name: autoName, user, isPrivate });
  }

  joinRoom(id: string) {
    const user = this.userService.user();
    if (!user) return;

    this.router.navigate(['/sala', id]);
  }



  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
