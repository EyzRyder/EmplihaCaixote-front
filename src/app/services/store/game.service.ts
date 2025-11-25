import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../ws.service';
import { User } from '../auth';
import { RoomInfo } from '../game';

//
// --- WebSocket Message Types ---
//
type ServerMessage =
  | { type: 'room-created'; room: any }
  | { type: 'player-joined'; room: any }
  | { type: 'player-reentered'; room: any }
  | { type: 'room-update'; room: any }
  | { type: 'start-game'; room: any; currentPlayerId?: string }
  | { type: 'turn-start'; playerId: string; timeLeft: number }
  | { type: 'turn-timeout'; playerId: string }
  | { type: 'room-updated'; room: any };

type ClientMessage =
  | {
    type: 'create-room';
    name: string;
    user: { id: string; username: string };
    isPrivate: boolean;
  }
  | {
    type: 'join-room';
    roomId: string;
    user: { id: string; username: string };
  };

@Injectable({
  providedIn: 'root',
})
export class GameService {
  room = signal<RoomInfo | null>(null);
  hasRoom = computed(() => !!this.room());
  constructor(private ws: WsService, private router: Router) {
    this.ws.onMessage().subscribe((msg) => this.handleMessage(msg));
  }

  private handleMessage(raw: any) {
    const msg = raw as ServerMessage;
    console.log('[GameService] Mensagem WS:', msg);

    switch (msg.type) {
      case 'room-created':
        this.updateRoom(msg.room);
        this.router.navigate(['/sala', msg.room.id]);
        break;

      case 'player-joined':
      case 'player-reentered':
      case 'room-update':
      case 'start-game':
      case 'room-updated':
        this.updateRoom(msg.room);
        break;

      case 'turn-start':
        // Optional: update room state if applicable
        console.log('[GameService] turn-start recebido:', msg);
        break;

      case 'turn-timeout':
        console.log('[GameService] turn-timeout recebido:', msg);
        break;

      default:
        console.warn('[GameService] Mensagem WS desconhecida:', msg);
        break;
    }
  }

  private updateRoom(room: any) {
    this.room.set(room);
  }

  createRoom(args: { name: string; user: User; isPrivate: boolean }) {
    const { name, user, isPrivate } = args;

    if (!name.trim() || !user?.id.trim()) return;

    const payload: ClientMessage = {
      type: 'create-room',
      name,
      user: { id: user.id, username: user.username },
      isPrivate,
    };

    this.ws.send(payload);
  }

  joinRoom(roomId: string, user: User) {
    if (!user?.id.trim()) return;

    const payload: ClientMessage = {
      type: 'join-room',
      roomId,
      user: { id: user.id, username: user.username },
    };

    this.ws.send(payload);
  }
}
