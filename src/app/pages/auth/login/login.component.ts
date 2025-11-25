import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthRequest } from '../../../services/auth';
import { CardLayoutComponent } from '../../../components/card-layout/card-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardLayoutComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private authService: UserService,
    private _location: Location,
    private _router: Router
  ) {}

  onLogin() {
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Não pode deixar nenhum campo vazio';
      return;
    } else {
      this.error = '';
    }
    const payload: AuthRequest = {
      username: this.username,
      password: this.password,
    };
    this.authService.login(payload).subscribe({
      next: () => {
        console.log('Logado');
        this._router.navigate(['/salas']);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Login falhou';
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
