import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
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

  buyPower({ powerId, amount, coins }: { powerId: number, amount: number, coins: number }): Observable<{ success: boolean }> {
    const moedaAtual = this.moeda();
    if (moedaAtual === null || moedaAtual < coins) {
      console.error("Saldo insuficiente ou usuário não carregado.");
      return new Observable<{ success: boolean }>((subscriber) => {
        subscriber.error({ message: "Saldo insuficiente para esta compra." });
      });
    }
    return this.http.post<{ success: boolean }>(this.apiUrl + "/buy/power", { powerId, amount }).pipe(
      tap((response) => {
        const user = this.userService.user();
        if (!user) {
          console.error("Usuário inexistente após compra bem-sucedida no backend.");
          return
        }
        const novoSaldo = moedaAtual! - coins;
        this.userService.setUser({ ...user, coins: novoSaldo });
      }),
    );
  }
}
