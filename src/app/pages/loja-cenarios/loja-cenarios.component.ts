import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

// Interface para o retorno do backend
export interface SkinPurchaseResponse {
  success: boolean;
  newGems: number;
}

@Component({
  selector: 'app-loja-cenarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loja-cenarios.component.html',
  styleUrl: './loja-cenarios.component.scss'
})
export class LojaCenariosComponent { // 🚨 Nome da classe alterado
  private apiUrl = `${environment.apiUrl.host}${environment.apiUrl.ip}${environment.apiUrl.port}`;
  diamante: Signal<number | null> = computed(() => this.userService.getUser()?.gems ?? 0);
  moeda: Signal<number | null> = computed(() => this.userService.getUser()?.coins ?? 0);
  inventory = computed(() => this.userService.inventory());
  skins = computed(() => this.userService.inventory().skins);

  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService,) {
    this.userService.getUserDetails().subscribe()
    this.userService.getUserInventory().subscribe()
  }

  /**
   * Compra um Cenário (usa a mesma lógica de skins).
   * @param skinId ID do cenário (skin) a ser comprado.
   * @param priceGems Custo do cenário em diamantes (para validação local/UX).
   */
  buySkinOrScenario(skinId: number, priceGems: number): void {

    this.errorMessage = null;

    // Validação Frontend (UX)
    const diamanteAtual = this.diamante();
    if (diamanteAtual === null || diamanteAtual < priceGems) {
      this.errorMessage = "Você não tem diamantes suficientes.";
      return;
    }
    console.log(skinId);
    console.log(priceGems);

    // Chamada ao backend
    this.http.post<SkinPurchaseResponse>(this.apiUrl + "/shop/buy/skin", { skinId }).subscribe({ // Mesma rota do backend

      // Lógica de sucesso
      next: (response) => {
        console.log(response);

        const user = this.userService.user();
        if (user) {
          this.userService.getUserDetails().subscribe()
        }
        console.log('Compra de Cenário bem-sucedida.');
      },

      // Lógica de erro (Padrão LoginComponent)
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Erro desconhecido ao processar a compra.';

        if (message === "Not enough gems") {
          this.errorMessage = "Saldo insuficiente de diamantes.";
        } else if (message.includes("User already owns this skin")) {
          this.errorMessage = "Você já possui este cenário.";
        } else {
          this.errorMessage = message;
        }

        console.error('Erro na compra:', message);
      }
    });
  }

  sanitizeUrl(url: string) {
    return url.replace(/\f/g, '/f'); // form-feed → "/"
  }
  useFundo(url: string) {
    const fundo = url.replace(/\f/g, '/f');
    this.userService.fundo.set(fundo)
  }

  usadoFundo(url: string) {
    const fundo = url.replace(/\f/g, '/f');
    console.log(this.userService.fundo());
    console.log(fundo);
    console.log(this.userService.fundo() == fundo);

    return this.userService.fundo() == fundo

  }
}