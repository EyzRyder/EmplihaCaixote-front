import { Component } from '@angular/core';
import { GameService } from '../../services/store/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WsService } from '../../services/ws.service';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule], 
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent {
  roomCode = "";
  roomName = '';
  playerName = '';
  rooms: any[] = [];

  constructor(
    private ws: WsService,
    public game: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    this.ws.connect();

    this.ws.onReady().subscribe(() => {
      this.ws.send({ type: 'get-rooms' });
    });

    this.ws.onMessage().subscribe((msg) => {
      console.log(msg);
      if (msg.type === 'rooms-fetched') {
        console.log(msg.rooms);
        this.rooms = msg.rooms
      }
      if (msg.type === 'rooms-update') {
        this.rooms = msg.rooms
      }
      if (msg.type === 'room-created') {
        // this.rooms.push(msg.room)
        this.router.navigate(['/room', msg.roomId]);
      }
    });
  }


  createPlayer() {
    if (!this.playerName.trim()) return;
    this.game.createPlayer(this.playerName);
  }

  createRoom() {
    this.game.createRoom();
  }

  joinRoom(id: string) {
        this.router.navigate(['/room', id.trim().toUpperCase()]);
  }

}
