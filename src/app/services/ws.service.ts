import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private ws!: WebSocket;
  private message$ = new Subject<any>();

  constructor() {}

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onmessage = (ev) => {
      try {
        this.message$.next(JSON.parse(ev.data));
      } catch {}
    };
  }

  onMessage() {
    return this.message$.asObservable();
  }

  send(data: any) {
    this.ws?.send(JSON.stringify(data));
  }
}
