import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, first, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WsService implements OnDestroy {
  private ws?: WebSocket;
  private url = 'ws://192.168.0.106:8080';

  private reconnectInterval = 2000; // 2s
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private message$ = new Subject<any>();
  private connectionState$ = new BehaviorSubject<'closed' | 'connecting' | 'open'>('closed');

  private sendQueue: any[] = [];
  private isManualClose = false;

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.connectionState$.next('connecting');
    this.ws = new WebSocket(this.url);
    // ---- on open -----------------------------------------------------------
    this.ws.onopen = () => {
      this.connectionState$.next('open');
      this.reconnectAttempts = 0;

      // flush queued messages
      queueMicrotask(() => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        for (const msg of this.sendQueue) {
          this.ws.send(msg);
        }
        this.sendQueue = [];
      });
    };
    // ---- on message --------------------------------------------------------
    this.ws.onmessage = (ev) => {
      this.ngZone.run(() => {

      try {
        this.message$.next(JSON.parse(ev.data));
      } catch {
        console.warn('[WS] Received non-JSON message', ev.data);
      }
    })

    };
    // ---- on error ----------------------------------------------------------
    this.ws.onerror = (err) => {
      console.error('[WS] WebSocket error: ', err);
    };

    this.ws.onclose = () => {
      this.connectionState$.next('closed');

      if (!this.isManualClose) {
        this.tryReconnect();
      }
    };
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max WebSocket reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  // -------------------
  // API
  // -------------------
  onMessage() {
    return this.message$.asObservable();
  }

  onOpen() {
    return this.connectionState$.pipe(
      filter((s) => s === 'open'),
      first()
    );
  }

  send(data: any) {
    const message = JSON.stringify(data);

    if (!this.ws) {
      // Not even connected yet: queue
      this.sendQueue.push(message);
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue until connection is open
      this.sendQueue.push(message);
    }
  }

  close() {
    this.isManualClose = true;
    this.ws?.close();
  }

  // -------------------
  // Limpeza
  // -------------------
  ngOnDestroy() {
    this.close();
    this.message$.complete();
    this.connectionState$.complete();
  }
}
