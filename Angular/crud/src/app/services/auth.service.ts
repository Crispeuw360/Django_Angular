import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, TokenResponse, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals para estado de autenticación
  private currentUserSignal = signal<User | null>(null);
  private accessTokenSignal = signal<string | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user_data');
    
    if (accessToken) {
      this.accessTokenSignal.set(accessToken);
    }
    if (userData) {
      try {
        this.currentUserSignal.set(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse | null> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap(response => {
        this.setTokens(response);
        this.isLoadingSignal.set(false);
        this.router.navigate(['/movies']);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        const errorMsg = error.error?.detail || 'Error al iniciar sesión';
        this.errorSignal.set(errorMsg);
        return of(null);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse | null> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, userData).pipe(
      tap(response => {
        this.isLoadingSignal.set(false);
        if (response) {
          // Después del registro exitoso, hacer login automático
          this.login({ username: userData.username, password: userData.password }).subscribe();
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        const errorMsg = error.error?.error || 'Error al registrar usuario';
        if (Array.isArray(errorMsg)) {
          this.errorSignal.set(errorMsg.join(', '));
        } else {
          this.errorSignal.set(errorMsg);
        }
        return of(null);
      })
    );
  }

  private setTokens(tokens: TokenResponse): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.accessTokenSignal.set(tokens.access);
  }

  refreshToken(): Observable<TokenResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<TokenResponse>(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        if (response) {
          localStorage.setItem('access_token', response.access);
          this.accessTokenSignal.set(response.access);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  setUser(user: User): void {
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}