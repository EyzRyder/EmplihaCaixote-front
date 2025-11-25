import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsService } from '../../services/ws.service';
import { GameService } from '../../services/store/game.service';
import { UserService } from '../../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

interface Box {
  row: number;
  col: number;
  player: number; // 1 ou 2
}

interface GameState {
  board: number[][];
  currentPlayerId: string;
  myId: string;
  myPlayer: number; // 1 ou 2
  roomId: string;
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | 'tie' | null;
}

interface TimerInfo {
  myTimeLeft: number;
  totalGameTime: number;
  isMyTurn: boolean;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  // Estado do jogo
  gameState: GameState = {
    board: [],
    currentPlayerId: '',
    myId: '',
    myPlayer: 0,
    roomId: '',
    gameStarted: false,
    gameOver: false,
    winner: null,
  };

  // Timers
  timerInfo: TimerInfo = {
    myTimeLeft: 15,
    totalGameTime: 0,
    isMyTurn: false,
  };

  // Caixas visuais
  boxes: Box[] = [];
  blockedColumns: number[] = [];
  usedPowers: Record<string, Record<string, boolean>> = {};

  // Configuração do grid
  private readonly GRID_ROWS = 6;
  private readonly GRID_COLS = 7;
  private readonly CELL_SIZE = 64;
  private readonly TURN_TIME_MAX = 15;

  // Controle de destroição e timers
  private destroy$ = new Subject<void>();
  private gameTimerInterval: any;
  private playerTimerInterval: any;
  private gameStartTime = 0;

  constructor(
    private ws: WsService,
    private router: Router,
    public game: GameService,
    public userService: UserService
  ) {
    effect(() => {
      const r = this.game.room();
      if (r && r.gameStarted && !this.gameState.gameStarted) {
        const currentPlayerId = r.players?.[r.turn]?.id;
        console.log(
          '[GAME] Estado de jogo detectado via efeito do GameService, inicializando'
        );
        this.handleGameStart({ room: r, currentPlayerId });
      }
    });
  }

  ngOnInit(): void {
    console.log('[GAME] Inicialização do GameComponent, assinando mensagens WS');
    this.setupWebSocketListeners();
    this.initializeBoard();

    // Edge case: If GameService already reports the room has started, initialize game from current state
    const currentRoom = this.game.room();
    if (currentRoom && currentRoom.gameStarted) {
      const currentPlayerId = currentRoom.players?.[currentRoom.turn]?.id;
      console.log(
        '[GAME] Sala já iniciada detectada via GameService, inicializando'
      );
      this.handleGameStart({ room: currentRoom, currentPlayerId });
    }

    // Efeito movido para o construtor para garantir contexto de injeção
  }

  ngOnDestroy(): void {
    this.stopAllTimers();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // INICIALIZAÇÃO
  // ========================================

  private initializeBoard(): void {
    this.gameState.board = Array.from({ length: this.GRID_ROWS }, () =>
      Array(this.GRID_COLS).fill(0)
    );
    this.updateBoxesFromBoard();
  }

  private setupWebSocketListeners(): void {
    this.ws
      .onMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log('[GAME] Mensagem WS recebida:', data?.type, data);
        this.handleWebSocketMessage(data);
      });
  }

  // ========================================
  // MANIPULAÇÃO DE MENSAGENS WEBSOCKET
  // ========================================

  private handleWebSocketMessage(data: any): void {
    const { type, ...content } = data;

    switch (type) {
      case 'start-game':
        this.handleGameStart(content);
        break;

      case 'turn-start':
        this.handleTurnStart(content);
        break;

      case 'play':
        this.handlePlay(content);
        break;

      case 'board-update':
        this.handleBoardUpdate(content);
        break;

      case 'column-blocked':
        this.handleColumnBlocked(content);
        break;

      case 'timer-update':
        this.handleTimerUpdate(content);
        break;

      case 'turn-timeout':
        this.handleTurnTimeout(content);
        break;

      case 'game-over':
        this.handleGameOver(content);
        break;

      case 'error':
        console.error('❌ Erro do servidor:', content);
        break;
    }
  }

  /**
   * Inicia o jogo
   */
  private handleGameStart(content: any): void {
    const { room, currentPlayerId } = content;

    this.gameState.board = room.board;
    this.gameState.roomId = room.id;
    this.gameState.currentPlayerId = currentPlayerId;
    this.gameState.gameStarted = true;

    // Determinar qual player sou eu (1 ou 2)
    // Essa informação virá do servidor no spawn_local_player anterior

    this.blockedColumns = room.blockedColumns || [];
    // Tenta descobrir qual é o id local do player
    if (room.players && Array.isArray(room.players)) {
      const localPlayer =
        room.players.find((p: any) => p.isLocal === true) ||
        room.players.find((p: any) => p.id === this.userService.user()?.id);

      if (localPlayer) {
        this.gameState.myId = localPlayer.id;
        const idx = room.players.findIndex((p: any) => p.id === localPlayer.id);
        this.gameState.myPlayer = idx !== -1 ? idx + 1 : 1;
      }
    }
    // Resetar uso de poderes no início de cada jogo
    this.usedPowers = {};
    this.updateBoxesFromBoard();

    this.gameStartTime = Date.now();
    this.startGameTimer();

    console.log('✓ Jogo iniciado!');
  }

  /**
   * Inicia um turno (mostrar timer do jogador)
   */
  private handleTurnStart(content: any): void {
    const { playerId, timeLeft } = content;

    this.gameState.currentPlayerId = playerId;
    this.timerInfo.myTimeLeft = timeLeft;
    this.timerInfo.isMyTurn = playerId === this.gameState.myId;

    this.startPlayerTimer();

    console.log(`→ Turno iniciado para: ${playerId}, tempo: ${timeLeft}s`);
  }

  /**
   * Atualiza a jogada visual
   */
  private handlePlay(content: any): void {
    const { row, column, player } = content;

    // Atualizar board
    if (
      this.gameState.board[row] &&
      this.gameState.board[row][column] !== undefined
    ) {
      this.gameState.board[row][column] = player;
    }

    this.updateBoxesFromBoard();
    console.log(`✓ Jogada: Player ${player} na posição (${row}, ${column})`);
  }

  /**
   * Atualiza todo o board (poderes como clear_bottom_line, eliminate_box)
   */
  private handleBoardUpdate(content: any): void {
    const { board, message } = content;

    this.gameState.board = board;
    this.updateBoxesFromBoard();

    if (message) {
      console.log(`⚡ Poder: ${message}`);
    }
  }

  /**
   * Coluna foi bloqueada
   */
  private handleColumnBlocked(content: any): void {
    const { col } = content;

    if (!this.blockedColumns.includes(col)) {
      this.blockedColumns.push(col);
    }

    console.log(`🚫 Coluna ${col} bloqueada`);
  }

  /**
   * Timer foi atualizado (reduzido por poder)
   */
  private handleTimerUpdate(content: any): void {
    const { timeLeft, message } = content;

    this.timerInfo.myTimeLeft = timeLeft;

    if (message) {
      console.log(`⚡ ${message}`);
    }
  }

  /**
   * Turno expirou por timeout
   */
  private handleTurnTimeout(content: any): void {
    const { playerId } = content;

    console.log(`⏰ Turno expirado para: ${playerId}`);
    // Se o timeout foi do jogador local, marcar isMyTurn false
    if (playerId === this.gameState.myId) {
      this.timerInfo.isMyTurn = false;
    }
    this.stopPlayerTimer();
  }

  /**
   * Jogo terminou
   */
  private handleGameOver(content: any): void {
    const { winnerId, board } = content;

    this.gameState.gameOver = true;
    this.gameState.winner = winnerId;
    this.gameState.board = board;

    this.updateBoxesFromBoard();
    this.stopAllTimers();

    if (winnerId === 'tie') {
      console.log('🤝 Jogo empatou!');
    } else if (winnerId === this.gameState.myId) {
      console.log('🎉 Você ganhou!');
    } else {
      console.log('😢 Você perdeu');
    }
  }

  // ========================================
  // AÇÕES DO JOGADOR
  // ========================================

  /**
   * 🟢 CORRIGIDO: Soltar caixa em uma coluna
   * Agora usa send() com ÚNICO parâmetro { type, content }
   */
  dropBox(column: number): void {
    // Validações
    if (!this.timerInfo.isMyTurn) {
      console.log('⚠ Não é sua vez!');
      return;
    }

    if (this.blockedColumns.includes(column)) {
      console.log('⚠ Coluna bloqueada!');
      return;
    }

    if (this.gameState.gameOver) {
      console.log('⚠ Jogo terminou!');
      return;
    }

    // 🟢 CORRIGIDO: Enviar ao servidor com formato correto
    this.ws.send({
      type: 'play-move',
      content: {
        roomId: this.gameState.roomId,
        playerId: this.gameState.myId,
        column: column,
      },
    });

    console.log(`→ Jogada: Coluna ${column}`);
  }

  /**
   * 🟢 CORRIGIDO: Usar um poder
   * Agora usa send() com ÚNICO parâmetro { type, content }
   */
  usePower(powerType: string, powerContent?: any): void {
    // 🟢 CORRIGIDO: Estrutura correta
    this.ws.send({
      type: 'use-power',
      content: {
        roomId: this.gameState.roomId,
        playerId: this.gameState.myId,
        powerType: powerType,
        data: powerContent || {},
      },
    });

    console.log(`→ Poder usado: ${powerType}`);
  }

  // ========================================
  // PODERES POR JOGADOR (UMA VEZ)
  // ========================================

  getPlayers(): any[] {
    return this.game.room()?.players || [];
  }

  getPlayerIdByIndex(index: number): string | undefined {
    const player = this.getPlayers()[index];
    return player?.id;
  }

  isLocalByIndex(index: number): boolean {
    const pid = this.getPlayerIdByIndex(index);
    return !!pid && pid === this.gameState.myId;
  }

  isPowerUsed(index: number, powerType: string): boolean {
    const pid = this.getPlayerIdByIndex(index);
    return !!pid && !!this.usedPowers[pid]?.[powerType];
  }

  canUsePower(index: number, powerType: string): boolean {
    const isLocal = this.isLocalByIndex(index);
    if (!isLocal) return false;
    if (this.gameState.gameOver) return false;
    return !this.isPowerUsed(index, powerType);
  }

  usePlayerPower(index: number, powerType: string, data?: any): void {
    if (!this.canUsePower(index, powerType)) return;
    this.usePower(powerType, data);
    const pid = this.getPlayerIdByIndex(index);
    if (!pid) return;
    if (!this.usedPowers[pid]) this.usedPowers[pid] = {};
    this.usedPowers[pid][powerType] = true;
  }

  /**
   * 🟢 IMPLEMENTADO: Navegar de volta para o lobby
   */
  navigateToLobby(): void {
    console.log('← Voltando para o lobby...');
    // `sala/:id` is the route for the lobby — use the correct path
    if (this.gameState.roomId) {
      this.router.navigate(['/sala', this.gameState.roomId]);
    } else {
      this.router.navigate(['/salas']);
    }
  }

  // ========================================
  // TIMERS
  // ========================================

  /**
   * Timer geral do jogo
   */
  private startGameTimer(): void {
    this.stopGameTimer();

    this.gameTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
      this.timerInfo.totalGameTime = elapsed;
    }, 1000);
  }

  /**
   * Timer do turno do jogador
   */
  private startPlayerTimer(): void {
    this.stopPlayerTimer();

    const startTime = Date.now();
    const initialTimeLeft = this.timerInfo.myTimeLeft;

    this.playerTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      this.timerInfo.myTimeLeft = Math.max(0, initialTimeLeft - elapsed);

      if (this.timerInfo.myTimeLeft <= 0) {
        this.stopPlayerTimer();
      }
    }, 100);
  }

  private stopGameTimer(): void {
    if (this.gameTimerInterval) {
      clearInterval(this.gameTimerInterval);
      this.gameTimerInterval = null;
    }
  }

  private stopPlayerTimer(): void {
    if (this.playerTimerInterval) {
      clearInterval(this.playerTimerInterval);
      this.playerTimerInterval = null;
    }
  }

  private stopAllTimers(): void {
    this.stopGameTimer();
    this.stopPlayerTimer();
  }

  // ========================================
  // VISUALIZAÇÃO DO GRID
  // ========================================

  /**
   * Converte o board em um array de boxes para renderização
   */
  private updateBoxesFromBoard(): void {
    this.boxes = [];

    for (let row = 0; row < this.GRID_ROWS; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        const cellValue = this.gameState.board[row][col];

        if (cellValue !== 0) {
          this.boxes.push({
            row,
            col,
            player: cellValue,
          });
        }
      }
    }
  }

  // ========================================
  // POSICIONAMENTO VISUAL
  // ========================================

  getBoxStyle(box: Box): any {
    const left = box.col * this.CELL_SIZE;
    const top = box.row * this.CELL_SIZE;
    const color = box.player === 1 ? "/pixels/caixa_vermelho_o.png" : "/pixels/caixa_azul_o.png"; // Red ou Cyan

    return {
      left: left + 'px',
      top: top + 'px',
      width: this.CELL_SIZE + 'px',
      height: this.CELL_SIZE + 'px',
      background: color,
    };
  }

  isColumnBlocked(col: number): boolean {
    return this.blockedColumns.includes(col);
  }

  getColumnButtonClass(col: number): string {
    let classes = 'column-button';

    if (this.isColumnBlocked(col)) {
      classes += ' blocked';
    } else if (this.timerInfo.isMyTurn && !this.gameState.gameOver) {
      classes += ' active';
    } else {
      classes += ' disabled';
    }

    return classes;
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  getPlayerColor(player: number): string {
    return player === 1 ? 'Vermelho' : 'Azul';
  }

  getPlayerColorHex(player: number): string {
  const src = player === 1 
    ? "/pixels/caixa_vermelho_x.png" 
    : "/pixels/caixa_azul_o.png";

  return `url('${src}')`;
}


  getTimePercentage(): number {
    return Math.max(0, (this.timerInfo.myTimeLeft / this.TURN_TIME_MAX) * 100);
  }

  getGameTimeFormatted(): string {
    const minutes = Math.floor(this.timerInfo.totalGameTime / 60);
    const seconds = this.timerInfo.totalGameTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getCurrentPlayerDisplay(): string {
    if (this.gameState.gameOver) {
      if (this.gameState.winner === 'tie') {
        return '🤝 Jogo Empatou!';
      } else if (this.gameState.winner === this.gameState.myId) {
        return '🎉 Você Ganhou!';
      } else {
        return '😢 Você Perdeu';
      }
    }

    if (this.timerInfo.isMyTurn) {
      return `Seu turno! (${this.timerInfo.myTimeLeft}s)`;
    } else {
      return `Turno do oponente (${this.timerInfo.myTimeLeft}s)`;
    }
  }
}
