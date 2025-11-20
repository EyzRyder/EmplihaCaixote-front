import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../ws.service';
import { v4 as uuidv4 } from 'uuid'; 
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private player: { id: string; name: string } | null = null;
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
      case 'room-created':
        this.room.set(msg.room);
        this.router.navigate(['/room',msg.roomId]);
        break;

      case 'room-joined':
        this.room.set(msg.room);
        this.router.navigate(['/room', msg.roomId]);
        break;

      case 'room-update':
        this.room.set(msg.room);
        break;
    }
  }

  createPlayer(name: string) {
      this.player = {
        id: uuidv4(),
        name,
      };
    }  

    getPlayer() {
      return this.player;
    }
  
    isPlayerCreated() {
      return this.player !== null;
    }

  createRoom() {
    if (!this.player?.id) return;
    this.ws.send({ type: 'create-room', name:"nome padrão"+uuidv4(),player:this.player, isPrivate:false });
  }

  joinRoom(roomCode: string) {
    if (!this.player?.id) return;
    this.ws.send({ type: 'join-room', roomCode, playerId: this.player.id });
  }
}
