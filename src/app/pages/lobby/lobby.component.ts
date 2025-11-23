import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/store/game.service';
import { CommonModule, Location } from '@angular/common';
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
  players = computed(() => this.room()?.players ?? []);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public game: GameService,
    public userService: UserService,
    private ws: WsService,
    private location: Location,
  ) {}
  
  ngOnInit() {
    this.OnInit()
  }

  private OnInit(){
    const user = this.userService.user();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (!id) {
        this.router.navigate(['/']);
        return;
      }
      this.roomId.set(id);

      this.ws.connect();

      if (this.ws.isOpen()) {
        this.game.joinRoom(id, user);
        return;
      }

      this.ws.onOpen().subscribe(() => {
        this.game.joinRoom(id, user);
      });
    });
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
