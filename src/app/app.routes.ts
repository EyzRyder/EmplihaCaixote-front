import { Routes } from '@angular/router';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { GameComponent } from './pages/game/game.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { CadastroComponent } from './pages/auth/cadastro/cadastro.component';
import { authGuard } from './guards/auth.guard';
import { LojaPoderesComponent } from './pages/loja-poderes/loja-poderes.component';
import { LojaMoedasComponent } from './pages/loja-moedas/loja-moedas.component';
import { LojaSkinsComponent } from './pages/loja-skins/loja-skins.component';
import { LojaDiamantesComponent } from './pages/loja-diamantes/loja-diamantes.component';
import { LojaCenariosComponent } from './pages/loja-cenarios/loja-cenarios.component';

export const routes: Routes = [
  { path: 'salas', component: RoomsComponent, canActivate: [authGuard], },
  { path: 'sala/:id', component: LobbyComponent, canActivate: [authGuard], },
  { path: 'game', component: GameComponent, canActivate: [authGuard], },
  { path: 'loja-poderes', component: LojaPoderesComponent, canActivate: [authGuard], },
  { path: 'loja-moedas', component: LojaMoedasComponent, canActivate: [authGuard],},
  { path: 'loja-skins', component: LojaSkinsComponent, canActivate: [authGuard],},
  { path: 'loja-diamantes', component: LojaDiamantesComponent, canActivate: [authGuard],},
  { path: 'loja-cenarios', component: LojaCenariosComponent, canActivate: [authGuard],},
  { path: 'login', component: LoginComponent  },
  { path: 'cadastro', component: CadastroComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // rota padrão
  { path: '**', redirectTo: '' },
];
