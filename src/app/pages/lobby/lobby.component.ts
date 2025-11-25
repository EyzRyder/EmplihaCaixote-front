import { Component, computed, signal, effect, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/store/game.service';
import { CommonModule, Location } from '@angular/common';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';
import { UserService } from '../../services/user.service';
import { WsService } from '../../services/ws.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, CardLayoutComponent],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnDestroy {
  roomId = signal('');

  // Signals para estado do jogo
  isReady = signal(false);
  bothReady = signal(false);
  gameStarted = signal(false);

  // Computed
  room = computed(() => this.game.room());
  players = computed(() => this.room()?.players ?? []);

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public game: GameService,
    public userService: UserService,
    private ws: WsService,
    private location: Location
  ) {
    // Effect para monitorar mudanças de estado dos jogadores (sem navegação)
    effect(() => {
      const room = this.room();
      if (room && room.players && room.players.length === 2) {
        const allReady = room.players.every((p: any) => !!room.ready?.[p.id]);
        this.bothReady.set(allReady);
      }
    });
  }

  ngOnInit() {
    this.onInit();
    this.setupWebSocketListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onInit() {
    const user = this.userService.user();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (!id) {
        this.router.navigate(['/']);
        return;
      }

      this.roomId.set(id);
      this.ws.connect();

      if (this.ws.isOpen()) {
        this.game.joinRoom(id, user);
        return;
      }

      this.ws
        .onOpen()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.game.joinRoom(id, user);
        });
    });
  }

  /**
   * Configura listeners do WebSocket para eventos específicos do jogo
   */
  private setupWebSocketListeners(): void {
    // Listener para quando o servidor notifica que um jogador ficou pronto
    if (this.ws) {
      // Log all incoming WS messages to help with debugging readiness flow
      this.ws
        .onMessage()
        .pipe(takeUntil(this.destroy$))
        .subscribe((msg: any) => {
          if (msg && msg.type) {
            console.log('[LOBBY] Mensagem WS:', msg.type, msg);
          }
          if (msg && msg.type === 'room-update') {
            console.log(
              '[LOBBY] Payload room-update:',
              msg.room || msg.rooms || msg
            );
          }
          if (msg && msg.type === 'start-game') {
            console.log('[LOBBY] Evento start-game recebido:', msg);
            this.gameStarted.set(true);
            this.router.navigate(['/game']);
          }
        });
      // If you need to handle specific events locally, add them here.
    }
  }

  /**
   * Marca o jogador como pronto
   */
  markPlayerReady(): void {
    if (this.isReady()) {
      console.log('⚠ Você já está pronto!');
      return;
    }

    const user = this.userService.user();
    const roomId = this.roomId();

    if (!user || !roomId) {
      console.error('❌ Dados insuficientes para marcar como pronto');
      return;
    }

    // Enviar comando ao servidor
    this.ws.send({
      type: 'player-ready',
      roomId: roomId,
      playerId: user.id,
      username: user.username,
    } as any);

    // Marcar localmente como pronto
    this.isReady.set(true);
    console.log('→ Enviado: Você está pronto!');
  }

  /**
   * Retorna o status de pronto de um jogador específico
   */
  getPlayerReadyStatus(player: any): string {
    const status = this.room()?.ready?.[player.id];
    return status ? '✓ Pronto' : 'Aguardando...';
  }

  /**
   * Classe CSS para o status de pronto
   */
  getPlayerReadyClass(player: any): string {
    const status = this.room()?.ready?.[player.id];
    return status ? 'status-ready' : 'status-waiting';
  }

  /**
   * Verifica se o botão deve estar desabilitado
   */
  isReadyButtonDisabled(): boolean {
    return this.isReady() || this.gameStarted() || this.players().length < 2;
  }

  /**
   * Texto do botão
   */
  getReadyButtonText(): string {
    if (this.gameStarted()) return '🚀 Jogo Iniciando...';
    if (this.isReady()) return '✓ Pronto!';
    if (this.players().length < 2) return 'Aguardando outro jogador...';
    return 'Estou Pronto';
  }

  /**
   * Mensagem de status
   */
  getStatusMessage(): string {
    if (this.players().length < 2) {
      return '⏳ Aguardando outro jogador para conectar...';
    }

    if (!this.isReady()) {
      return '⏳ Clique em "Estou Pronto" para começar';
    }

    if (this.bothReady() && !this.gameStarted()) {
      return '✓ Ambos prontos! Iniciando jogo...';
    }

    if (this.gameStarted()) {
      return '🚀 Jogo iniciando!';
    }

    return '⏳ Aguardando oponente...';
  }

  getStatusMessageClass(): string {
    if (this.bothReady()) {
      return 'status-ready';
    }
    if (this.isReady()) {
      return 'status-waiting';
    }
    return 'status-waiting';
  }

  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------

  goBack(): void {
    this.router.navigate(['/salas']);
  }
}
