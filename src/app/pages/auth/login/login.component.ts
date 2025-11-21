import { Component } from '@angular/core';
import {  UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthRequest } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private authService: UserService,
    private _location: Location,
    private _router: Router) {}

  onLogin() {
    if (this.username.trim() == '' || this.password.trim() == '') {
      this.error = 'Não pode deixar nenhum campo vazio';
      return;
    } else {
      this.error = '';
    }
    const payload: AuthRequest= {
      username: this.username,
      password: this.password,
    };
    this.authService.login(payload).subscribe({
      next: () => {
        console.log('Logged in');
        this._router.navigate(['/rooms']); 
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed';
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
