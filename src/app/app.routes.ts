import { Routes } from '@angular/router';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { GameComponent } from './pages/game/game.component';

export const routes: Routes = [
  { path: 'rooms', component: RoomsComponent },
  { path: 'room', component: LobbyComponent },
  { path: 'game', component: GameComponent },

  // rota padrão
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: '**', redirectTo: 'rooms' },
];
