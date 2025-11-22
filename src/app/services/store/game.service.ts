import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../ws.service';
import { v4 as uuidv4 } from 'uuid'; 
import { User } from '../auth';
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
        this.router.navigate(['/sala',msg.roomId]);
        break;

      case 'player-joined':
        this.room.set(msg.room);
        this.router.navigate(['/sala', msg.room.id]);
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

  createRoom({name,user,isPrivate}:{name:string,user:User,isPrivate:boolean}) {
    if (user.id.trim()=="" || name.trim()=="") return;
    this.ws.send({ type: 'create-room', name ,player:{name:user.username, id:user.id}, isPrivate });
  }

  joinRoom(roomId: string,user:User) {
    if (!user) return;

    this.ws.send({ type: 'join-room', roomId, player: {name:user.username, id:user.id}});
  }
}
