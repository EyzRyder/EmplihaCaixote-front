import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { RouterLink } from '@angular/router'; 

// Interface para o retorno do backend
export interface GemsPurchaseResponse {
  success: boolean;
  newGems: number;
}

@Component({
  selector: 'app-loja-diamantes',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './loja-diamantes.component.html',
  styleUrl: './loja-diamantes.component.scss'
})
export class LojaDiamantesComponent {
  private apiUrl = 'http://192.168.0.2:8080';
  diamante: Signal<number | null> = computed(() => this.userService.user()?.gems ?? 0);
  moeda: Signal<number | null> = computed(() => this.userService.user()?.coins ?? 0);
  
  errorMessage: string | null = null; 

  constructor(
      private http: HttpClient,
      private userService: UserService){
  }

  /**
   * Adiciona diamantes à carteira do usuário.
   * @param gemsAmount Quantidade de diamantes a receber.
   */
  buyGems(gemsAmount: number): void {
    
    this.errorMessage = null; 

    // O preço (em dinheiro real) não é validado aqui, apenas a quantidade.
    if (gemsAmount <= 0) {
        this.errorMessage = "A quantidade deve ser positiva.";
        return;
    }
    
    // 1. Chamada ao backend
    this.http.post<GemsPurchaseResponse>(this.apiUrl+"/shop/buy/gems", {gemsAmount}).subscribe({
        
        // 2. Lógica de sucesso (next)
        next: (response) => {
            if (response.success) {
                const user = this.userService.user();
                if(user) {
                    // Atualiza o Signal apenas com o novo saldo de diamantes
                    this.userService.setUser({...user, gems: response.newGems});
                }
                console.log('Compra de diamantes bem-sucedida.');
            }
        },
        
        // 3. Lógica de erro (aplicando o padrão do login)
        error: (err: HttpErrorResponse) => {
            const message = err.error?.message || 'Erro desconhecido ao processar a compra.';
            
            if (message.includes("User Not Found")) {
                 this.errorMessage = "Usuário não encontrado.";
            } else {
                 this.errorMessage = message;
            }
            
            console.error('Erro na compra de diamantes:', message);
        }
    });
  }
}