import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, Inventory, User } from './auth';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = `${environment.apiUrl.host}${environment.apiUrl.ip}${environment.apiUrl.port}`;
  private _user = signal<User | null>(
    JSON.parse(localStorage.getItem('auth_user') || 'null')
  );
  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  fundo = signal<string>("pixels/fundos/fundo.png");

  inventory = signal<Inventory>({
    powers: [],
    skins: []
  })
  constructor(private http: HttpClient) { }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + "/auth/login", payload).pipe(
      tap((response) => {
        this.setUser(response.user);
        localStorage.setItem('auth_token', response.token);
      })
    );
  }

  register(payload: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl + "/auth/register", payload)
      .pipe(
        tap((response) => {
          this.setUser(response.user);
          localStorage.setItem('auth_token', response.token);
        }),
      );
  }

  getUserDetails(): Observable<User> {
    return this.http.get<User>(this.apiUrl + "/auth").pipe(
      tap((response) => {
        this.setUser(response);
      })
    );
  }

  getUserInventory(): Observable<any> {
    return this.http.get<any>(this.apiUrl + "/shop/inventory").pipe(
      tap((response) => {
        this.inventory.set({
          powers: response.powers,
          skins: response.skins
        });
        console.log(this.inventory());
        // this.setUser(response);
      })
    );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  setUser(data: AuthResponse['user']) {
    this._user.set(data);
    localStorage.setItem('auth_user', JSON.stringify(data));
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser() {
    const user = this._user();
    return user ? user : null;
  }
}
