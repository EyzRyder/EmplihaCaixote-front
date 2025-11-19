import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private ws!: WebSocket;
  private message$ = new Subject<any>();
  private ready$ = new Subject<void>();

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket('ws://192.168.0.106:8080');

    this.ws.onopen = () => {
      this.ready$.next();
    };

    this.ws.onmessage = (ev) => {
      try {
        this.message$.next(JSON.parse(ev.data));
      } catch {}
    };
  }

  onReady() {
    return this.ready$.asObservable();
  }

  onMessage() {
    return this.message$.asObservable();
  }

  send(data: any) {
    this.ws?.send(JSON.stringify(data));
  }
}
