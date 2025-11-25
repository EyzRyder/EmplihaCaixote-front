import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, Signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Observable, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

export interface ExchangeResponse {
  success: boolean;
  newCoins: number;
  newGems: number;
}

@Component({
  selector: 'app-loja-moedas',
  imports: [RouterLink, CommonModule],
  templateUrl: './loja-moedas.component.html',
  styleUrl: './loja-moedas.component.scss'
})
export class LojaMoedasComponent {
  private apiUrl = `${environment.apiUrl.host}${environment.apiUrl.ip}${environment.apiUrl.port}`;
  diamante: Signal<number | null> = computed(() => this.userService.getUser()?.gems ?? 0);
  moeda: Signal<number | null> = computed(() => this.userService.getUser()?.coins ?? 0);
  errorMessage: string | null = null;

  inventory = computed(() => this.userService.inventory());

  constructor(
    private http: HttpClient,
    private userService: UserService) {
    this.userService.getUserDetails().subscribe()
    this.userService.getUserInventory().subscribe()

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
    this.http.post<ExchangeResponse>(this.apiUrl + "/shop/exchange/coins", { coinsAmount, gemsPrice }).subscribe({

      // 2. Lógica de sucesso (next)
      next: (response) => {
        const user = this.userService.user();
        if (user) {
          // Atualiza o Signal com os novos saldos
          this.userService.setUser({ ...user, coins: response.newCoins, gems: response.newGems });
        }
        console.log('Compra de moedas bem-sucedida.');

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
