import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router'; 

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
  private apiUrl = 'http://192.168.0.2:8080';
  diamante: Signal<number | null> = computed(() => this.userService.user()?.gems ?? 0);
  moeda: Signal<number | null> = computed(() => this.userService.user()?.coins ?? 0);
  
  errorMessage: string | null = null; 

  constructor(
      private http: HttpClient,
      private userService: UserService){
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
    
    // Chamada ao backend
    this.http.post<SkinPurchaseResponse>(this.apiUrl+"/buy/skin", {skinId}).subscribe({ // Mesma rota do backend
        
        // Lógica de sucesso
        next: (response) => {
            if (response.success) {
                const user = this.userService.user();
                if(user) {
                    this.userService.setUser({...user, gems: response.newGems});
                }
                console.log('Compra de Cenário bem-sucedida.');
            }
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
}