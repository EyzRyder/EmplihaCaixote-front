import { Routes } from '@angular/router';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { GameComponent } from './pages/game/game.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { CadastroComponent } from './pages/auth/cadastro/cadastro.component';

export const routes: Routes = [
  { path: 'rooms', component: RoomsComponent },
  { path: 'room/:id', component: LobbyComponent },
  { path: 'game', component: GameComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // rota padrão
  { path: '**', redirectTo: '' },
];
