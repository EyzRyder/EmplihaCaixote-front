import { Component, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/store/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  roomCode
  room = computed(() => this.game.room());
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public game: GameService
  ) {
    this.roomCode = this.route.snapshot.paramMap.get("roomCode")!;

  }

  get players() {
    return this.room()?.players ?? [];
  }

}
