import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/store/game.service';
import { CommonModule } from '@angular/common';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';
import { UserService } from '../../services/user.service';
import { WsService } from '../../services/ws.service';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule, CardLayoutComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent {
  roomId = signal('');
  room = computed(() => this.game.room());

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    public game: GameService,
    public userService: UserService,
    private ws: WsService,
    
  ) {}
  ngOnInit() {
    this.OnInit()
  }

  private OnInit(){
    const user = this.userService.user();
    this.route.params.subscribe((params) => {
      this.roomId.set(params['id']);
    });
    if (!user || !this.roomId()) {
      this._router.navigate(['/']);
      return;
    }

    this.ws.connect();

    this.ws.onReady().subscribe(() => {
      this.game.joinRoom(this.roomId(), user);
      
    });

  }

  get players() {
    return this.room()?.players ?? [];
  }
}
