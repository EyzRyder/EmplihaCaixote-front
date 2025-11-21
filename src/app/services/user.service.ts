import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, LoginResponse, User } from './auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://192.168.0.106:8080/auth/login';
  private _user = signal<User | null>(
    JSON.parse(localStorage.getItem('auth_user') || 'null'),
  );
  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  constructor(private http: HttpClient) {}

  login(payload: AuthRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, payload).pipe(
      tap((response) => {
        this.setUser(response.user);
        localStorage.setItem('auth_token', response.token);
      }),
    );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  setUser(data: LoginResponse['user']) {
    this._user.set(data);
    localStorage.setItem('auth_user', JSON.stringify(data));
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
}
