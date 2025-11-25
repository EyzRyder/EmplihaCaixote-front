import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, first, Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WsService implements OnDestroy {
  private ws?: WebSocket;
  private url = `ws://${environment.apiUrl.ip}${environment.apiUrl.port}`;

  private reconnectInterval = 2000; // 2s
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  public message$ = new Subject<any>();
  private connectionState$ = new BehaviorSubject<
    'closed' | 'connecting' | 'open'
  >('closed');

  private sendQueue: string[] = [];
  private isManualClose = false;

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  // ---------------------------------
  // Connection
  // ---------------------------------
  connect(): void {
    this.isManualClose = false;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.connectionState$.next('connecting');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS] Conectado');
      this.connectionState$.next('open');
      this.reconnectAttempts = 0;

      queueMicrotask(() => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        for (const msg of this.sendQueue) {
          this.ws.send(msg);
        }
        this.sendQueue = [];
      });
    };

    this.ws.onmessage = (ev) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(ev.data);
          console.log('[WS] Mensagem recebida:', data.type);
          this.message$.next(data);
        } catch (error) {
          console.warn('[WS] Mensagem não-JSON recebida:', ev.data);
        }
      });
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Erro', err);
    };

    this.ws.onclose = () => {
      console.warn('[WS] Conexão encerrada');
      this.connectionState$.next('closed');
      if (!this.isManualClose) {
        this.tryReconnect();
      }
    };
  }

  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Máximo de tentativas de reconexão atingido');
      return;
    }
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.reconnectInterval);
  }

  // ---------------------------------
  // API helpers
  // ---------------------------------
  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  onMessage() {
    return this.message$.asObservable();
  }

  onOpen() {
    return this.connectionState$.pipe(
      filter((s) => s === 'open'),
      first()
    );
  }

  /**
   * Send a message to the backend. Accepts either a single payload { type, ... }
   * or the (type, payload) pair used in some components.
   */
  send(typeOrPayload: any, payload?: any): void {
    let messageObj: any;
    if (typeof typeOrPayload === 'string') {
      messageObj = { type: typeOrPayload, ...(payload || {}) };
    } else {
      messageObj = typeOrPayload || {};
    }

    const message = JSON.stringify(messageObj);

    if (!this.ws) {
      this.sendQueue.push(message);
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.sendQueue.push(message);
    }
  }

  close(): void {
    this.isManualClose = true;
    this.ws?.close();
  }

  ngOnDestroy(): void {
    this.close();
    this.message$.complete();
    this.connectionState$.complete();
  }
}
