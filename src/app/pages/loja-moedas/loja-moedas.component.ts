import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, Signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Observable, tap } from 'rxjs';
import { RouterLink } from '@angular/router';

export interface ExchangeResponse {
  success: boolean;
  newCoins: number;
  newGems: number;
}

@Component({
  selector: 'app-loja-moedas',
  imports: [RouterLink],
  templateUrl: './loja-moedas.component.html',
  styleUrl: './loja-moedas.component.scss'
})
export class LojaMoedasComponent {
  private apiUrl = 'http://192.168.0.2:8080';
  diamante: Signal<number | null> = computed(() => this.userService.user()?.gems??0);
  moeda: Signal<number | null> = computed(() => this.userService.user()?.coins??0);
  errorMessage: string | null = null; 

  constructor(
      private http: HttpClient,
      private userService: UserService){
  }

  /**
   * Compra moedas (coinsAmount) pagando com diamantes (gemsPrice).
   */
  exchangeCoinsForGems(coinsAmount: number, gemsPrice: number): void {
    
    // Limpa a mensagem de erro anterior
    this.errorMessage = null; 

    // Validação frontend (opcional, mas bom para UX)
    const diamanteAtual = this.diamante();
    if (diamanteAtual === null || diamanteAtual < gemsPrice) {
      this.errorMessage = "Você não tem diamantes suficientes.";
      return; 
    }
    
    // 1. Chamada ao backend
    this.http.post<ExchangeResponse>(this.apiUrl+"/exchange/coins-for-gems", {coinsAmount, gemsPrice}).subscribe({
        
        // 2. Lógica de sucesso (next)
        next: (response) => {
            if (response.success) {
                const user = this.userService.user();
                if(user) {
                    // Atualiza o Signal com os novos saldos
                    this.userService.setUser({...user, coins: response.newCoins, gems: response.newGems});
                }
                console.log('Compra de moedas bem-sucedida.');
            }
        },
        
        // 3. Lógica de erro (aplicando o padrão do LoginComponent)
        error: (err: HttpErrorResponse) => {
            // Captura a mensagem de erro do backend ou define uma mensagem padrão
            const message = err.error?.message || 'Erro desconhecido ao processar a troca.';
            
            // Exibe a mensagem de erro
            if (message === "Not enough gems") {
                this.errorMessage = "Saldo insuficiente de diamantes.";
            } else if (message.includes("User Not Found")) {
                 this.errorMessage = "Usuário não encontrado.";
            } else {
                 this.errorMessage = message;
            }
            
            console.error('Erro na compra:', message);
        }
    });
  }

}
