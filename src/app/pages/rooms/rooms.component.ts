import { Component, computed, signal } from '@angular/core';
import { GameService } from '../../services/store/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WsService } from '../../services/ws.service';
import { CardLayoutComponent } from '../../components/card-layout/card-layout.component';
import { UserService } from '../../services/user.service';
import { RoomInfo } from '../../services/game';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, CardLayoutComponent, RouterLink],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent {
  roomName = '';

  private _rooms = signal<RoomInfo[]>([]);
  rooms = computed(() => this._rooms());

  constructor(
    private ws: WsService,
    public game: GameService,
    private userService: UserService,
    private router: Router,
    private location: Location
  ) {
    this.initializeConnection();
  }

  // ========================================
  // INICIALIZAÇÃO
  // ========================================

  /**
   * Inicializa a conexão WebSocket
   */
  private initializeConnection(): void {
    // 🟢 CORREÇÃO: Simplificado - apenas chamar connect()
    this.ws.connect();
    this.userService.getUserDetails()

    if (this.ws.isOpen()) {
      this.requestRoomsList();
      return;
    }

    // Se não estiver aberto, aguardar
    this.ws.onOpen().subscribe(() => {
      this.requestRoomsList();
    });
  }

  ngOnInit(): void {
    this.initWebSocketListeners();
  }

  /**
   * 🟢 CORREÇÃO: Setup dos listeners WebSocket
   */
  private initWebSocketListeners(): void {
    this.ws.onMessage().subscribe((msg: any) => {
      console.log('[ROOMS] Mensagem recebida:', msg.type);

      switch (msg.type) {
        case 'rooms-updated':
          this.handleRoomsUpdated(msg);
          break;

        case 'error':
          console.error('[ROOMS] Erro:', msg.message);
          break;

        default:
          console.log('[ROOMS] Mensagem desconhecida:', msg.type);
      }
    });
  }

  // ========================================
  // REQUISIÇÕES AO SERVIDOR
  // ========================================

  /**
   * 🟢 CORREÇÃO: Envia requisição de lista de salas
   */
  private requestRoomsList(): void {
    this.ws.send({
      type: 'get-rooms',
    });
  }

  /**
   * 🟢 CORREÇÃO: Handler para 'rooms-updated'
   */
  private handleRoomsUpdated(msg: any): void {
    const rooms = msg.rooms || [];
    this._rooms.set(rooms);
    console.log('[ROOMS] Salas atualizadas:', rooms.length);

    // Verificar se o usuário está em alguma sala
    const user = this.userService.user();
    if (user) {
      for (const room of rooms) {
        const playerExists = room.players?.find((p: any) => p.id === user.id);

        if (playerExists) {
          console.log('[ROOMS] Usuário encontrado na sala:', room.id);
          this.router.navigate(['/sala', room.id]);
          return;
        }
      }
    }
  }

  // ========================================
  // AÇÕES
  // ========================================

  /**
   * 🟢 CORREÇÃO: Criar uma nova sala
   */
  createRoom(isPrivate: boolean): void {
    const user = this.userService.user();
    if (!user) {
      console.warn('[ROOMS] Usuário não autenticado');
      return;
    }

    const autoName = `Sala de ${user.username}`;

    // Usar GameService para criar a sala
    this.game.createRoom({
      name: autoName,
      user,
      isPrivate,
    });

    console.log('[ROOMS] Sala criada:', autoName);
  }

  /**
   * 🟢 CORREÇÃO: Entrar em uma sala existente
   */
  joinRoom(id: string): void {
    const user = this.userService.user();
    if (!user) {
      console.warn('[ROOMS] Usuário não autenticado');
      return;
    }

    console.log('[ROOMS] Entrando na sala:', id);
    this.router.navigate(['/sala', id]);
  }

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  /**
   * Voltar para a página anterior
   */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
