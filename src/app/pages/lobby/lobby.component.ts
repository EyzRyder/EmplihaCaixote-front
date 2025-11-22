import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/store/game.service';
import { CommonModule } from '@angular/common';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule,CardLayoutComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  roomId = signal("")
  room = computed(() => this.game.room());
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public game: GameService
  ) {
    this.route.params.subscribe((params) => { this.roomId.set(params['id']); });    
  }

  get players() {
    return this.room()?.players ?? [];
  }

}
