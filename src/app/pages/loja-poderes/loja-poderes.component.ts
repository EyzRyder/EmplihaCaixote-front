import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-loja-poderes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loja-poderes.component.html',
  styleUrl: './loja-poderes.component.scss'
})
export class LojaPoderesComponent {
  private apiUrl = `${environment.apiUrl.host}${environment.apiUrl.ip}${environment.apiUrl.port}`;
  diamante: Signal<number | null> = computed(() => this.userService.getUser()?.gems ?? 0);
  moeda: Signal<number | null> = computed(() => this.userService.getUser()?.coins ?? 0);

  constructor(
    private http: HttpClient,
    private userService: UserService) {
    this.userService.getUserDetails().subscribe()
  }

  buyPower({ powerId, amount = 1, coins }: { powerId: number, amount: number, coins: number }) {
    const moedaAtual = this.moeda();
    if (moedaAtual === null || moedaAtual < coins) {
      console.error("Saldo insuficiente ou usuário não carregado.");
      return new Observable<{ success: boolean }>((subscriber) => {
        subscriber.error({ message: "Saldo insuficiente para esta compra." });
      });
    }
    console.log("Test");

    return this.http.post<any>(this.apiUrl + "/shop/buy/power", { powerId, amount }).subscribe({

      // 2. Lógica de sucesso (next)
      next: (response) => {
        const user = this.userService.user();
        console.log(response);

        if (!user) {
          console.error();
          throw new Error("Usuário inexistente após compra bem-sucedida no backend.")
        }
        const novoSaldo = moedaAtual! - coins;
        this.userService.setUser({ ...user, coins: novoSaldo });

      },

      // 3. Lógica de erro (aplicando o padrão do login)
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Erro desconhecido ao processar a compra.';

        // if (message.includes("User Not Found")) {
        //   this.errorMessage = "Usuário não encontrado.";
        // } else {
        //   this.errorMessage = message;
        // }

        console.error('Erro na compra de diamantes:', message);
      }
    })
  }
}
