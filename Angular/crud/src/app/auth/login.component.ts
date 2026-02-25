import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>{{ isRegisterMode() ? 'Registrarse' : 'Iniciar Sesión' }}</h2>
        
        @if (authService.error()) {
          <div class="error-message">
            {{ authService.error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #authForm="ngForm">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="username" 
              required
              placeholder="Nombre de usuario"
            />
          </div>

          @if (isRegisterMode()) {
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="email" 
                required
                placeholder="correo@ejemplo.com"
              />
            </div>
          }

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              placeholder="Contraseña"
            />
          </div>

          @if (isRegisterMode()) {
            <div class="form-group">
              <label for="password2">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="password2" 
                name="password2" 
                [(ngModel)]="password2" 
                required
                placeholder="Repetir contraseña"
              />
            </div>
          }

          <button type="submit" [disabled]="authForm.invalid || authService.isLoading()" class="btn-primary">
            @if (authService.isLoading()) {
              Procesando...
            } @else {
              {{ isRegisterMode() ? 'Registrarse' : 'Entrar' }}
            }
          </button>
        </form>

        <div class="toggle-mode">
          <p>
            {{ isRegisterMode() ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
            <button type="button" (click)="toggleMode()" class="btn-link">
              {{ isRegisterMode() ? 'Iniciar Sesión' : 'Registrarse' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .auth-card {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    h2 {
      color: #e94560;
      text-align: center;
      margin-bottom: 30px;
      font-size: 1.8rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #eee;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #16213e;
      border-radius: 8px;
      background: #16213e;
      color: #eee;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #e94560;
      box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2);
    }

    input::placeholder {
      color: #666;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #e94560, #c23a51);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(233, 69, 96, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-mode {
      text-align: center;
      margin-top: 24px;
      color: #888;
    }

    .btn-link {
      background: none;
      border: none;
      color: #e94560;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      margin-left: 5px;
    }

    .btn-link:hover {
      text-decoration: underline;
    }

    .error-message {
      background: rgba(233, 69, 96, 0.2);
      border: 1px solid #e94560;
      color: #ff6b6b;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  email = '';
  password = '';
  password2 = '';
  
  isRegisterMode = signal(false);

  toggleMode(): void {
    this.isRegisterMode.update(v => !v);
    this.authService.clearError();
  }

  onSubmit(): void {
    if (this.isRegisterMode()) {
      this.register();
    } else {
      this.login();
    }
  }

  private login(): void {
    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe();
  }

  private register(): void {
    if (this.password !== this.password2) {
      return;
    }

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2
    }).subscribe();
  }
}
