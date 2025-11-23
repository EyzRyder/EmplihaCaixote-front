export interface RoomInfo {
    id: string;
    name: string;
    isPrivate: boolean;
    players: { id: string; username: string }[];
    maxPlayers: number
    ready: Record<string, boolean>;
    board: number[][]; // connect 4 6x7
    turn: number; // index do jogador (0 ou 1)
    gameStarted: boolean;
  
  }