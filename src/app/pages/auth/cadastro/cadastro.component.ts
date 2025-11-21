import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, FormsModule],
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
      private _router: Router) {}

      onCadastro(){}
      goBack(): void {
        if (window.history.length > 1) {
          this._location.back();
        } else {
          this._router.navigate(['/']); 
        }
      }
}
