import { Injectable } from '@angular/core';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../services/ws.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  playerId = signal<string | null>(null);
  room = signal<any | null>(null);

  constructor(
    private ws: WsService,
    private router: Router,
  ) {
    this.ws.connect();
    this.ws.onMessage().subscribe((msg) => this.handleMessage(msg));
  }

  private handleMessage(msg: any) {
    switch (msg.type) {
      case 'player_created':
        this.playerId.set(msg.playerId);
        break;

      case 'room_created':
        this.room.set(msg.room);
        this.router.navigate(['/room', msg.roomCode]);
        break;

      case 'room_joined':
        this.room.set(msg.room);
        this.router.navigate(['/room', msg.roomCode]);
        break;

      case 'room_update':
        this.room.set(msg.room);

        // Quando tiver 2 players → ir para o board
        if (msg.room.players.length === 2) {
          this.router.navigate(['/room', msg.room.roomCode, 'board']);
        }
        break;
    }
  }

  createPlayer(name: string) {
    this.ws.send({ type: 'create_player', name });
  }

  createRoom() {
    if (!this.playerId()) return;
    this.ws.send({ type: 'create_room', playerId: this.playerId() });
  }

  joinRoom(roomCode: string) {
    if (!this.playerId()) return;
    this.ws.send({ type: 'join_room', roomCode, playerId: this.playerId() });
  }
}
