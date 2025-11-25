import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loja-poderes',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './loja-poderes.component.html',
  styleUrl: './loja-poderes.component.scss'
})
export class LojaPoderesComponent {
  private apiUrl = 'http://192.168.0.2:8080';
  diamante: Signal<number | null> = computed(() => this.userService.user()?.gems??0);
  moeda: Signal<number | null> = computed(() => this.userService.user()?.coins??0);

  constructor(
      private http: HttpClient,
      private userService: UserService){
  }

buyPower({powerId, amount, coins}: {powerId: number, amount: number, coins: number}): Observable<{ success: boolean }> {
    const moedaAtual = this.moeda();
    if (moedaAtual === null || moedaAtual < coins) {
      console.error("Saldo insuficiente ou usuário não carregado.");
      return new Observable<{ success: boolean }>((subscriber) => {
        subscriber.error({message: "Saldo insuficiente para esta compra."});
      });
    }
    return this.http.post<{ success: boolean }>(this.apiUrl+"/buy/power", {powerId, amount}).pipe(
        tap((response) => {
            if (response.success) {
                const user = this.userService.user();
                if(!user){
                    console.error("Usuário inexistente após compra bem-sucedida no backend.");
                    return 
                }
                const novoSaldo = moedaAtual! - coins;
                this.userService.setUser({...user, coins: novoSaldo});
            }
        }),
    );
}
}
