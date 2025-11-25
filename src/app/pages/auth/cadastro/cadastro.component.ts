import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthRequest } from '../../../services/auth';
import { CardLayoutComponent } from '../../../components/card-layout/card-layout.component';

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, FormsModule,CardLayoutComponent],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {
  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  constructor(
    private authService: UserService,
    private _location: Location,
    private _router: Router) { }

  onCadastro() {
    if (this.username.trim() == '' || this.password.trim() == '' || this.confirmPassword.trim() == '') {
      this.error = 'Não pode deixar nenhum campo vazio';
      return;
    } else if (this.password !== this.confirmPassword) {
      this.error = 'Confirma sua senha, eles estão diferentes';
      return;
    } else {
      this.error = '';
    }
    const payload: AuthRequest = {
      username: this.username,
      password: this.password,
    };
    this.authService.register(payload).subscribe({
      next: () => {
        console.log('Logged in');
        this._router.navigate(['/salas']);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Cadastro Falhou, tente novamente depos';
      },
    });

  }
  goBack(): void {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this._router.navigate(['/']);
    }
  }
}
