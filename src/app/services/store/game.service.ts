import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../ws.service';
import { User } from '../auth';
@Injectable({
  providedIn: 'root',
})
export class GameService {
  room = signal<any | null>(null);

  constructor(
    private ws: WsService,
    private router: Router,
  ) {
    this.ws.connect();
    this.ws.onMessage().subscribe((msg) => this.handleMessage(msg));
  }

  private handleMessage(msg: any) {
    console.log(msg);
    switch (msg.type) {
      case 'room-created':
        this.room.set(msg.room);
        this.router.navigate(['/sala', msg.room.id]);
        break;

      case 'player-joined':
      case 'player-reentered':
        this.room.set(msg.room);
        break;

      case 'room-update':
        this.room.set(msg.room);
        break;
    }
  }

  createRoom({
    name,
    user,
    isPrivate,
  }: {
    name: string;
    user: User;
    isPrivate: boolean;
  }) {
    if (user.id.trim() == '' || name.trim() == '') return;
    this.ws.send({
      type: 'create-room',
      user: { username: user.username, id: user.id },
      isPrivate,
    });
  }

  joinRoom(roomId: string, user: User) {
    if (!user) return;

    this.ws.send({
      type: 'join-room',
      roomId,
      user: { username: user.username, id: user.id },
    });
  }
}
