import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  selectedRole: 'Admin' | 'User' = 'Admin';
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading = false;

  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  private extractAuthPayload(response: any): { token: string | null; user: any } {
    const payload = response?.data ?? response;
    const token =
      payload?.token ||
      payload?.accessToken ||
      payload?.jwt ||
      null;
    return { token, user: payload?.user };
  }

  setRole(role: 'Admin' | 'User') {
    this.selectedRole = role;
    this.errorMessage = ''; // Clear error when switching roles
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const { token, user } = this.extractAuthPayload(response);

        if (!token) {
          this.errorMessage =
            response?.message || 'Login failed: no authentication token received.';
          return;
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token);
        localStorage.setItem('tenantId', '1');
        localStorage.setItem('userRole', this.selectedRole);

        this.authService.setUserSession(user);

        this.router.navigate([this.authService.getHomeRoute()]);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error', err);
        this.errorMessage =
          err?.error?.message ||
          'Login failed. Please check your credentials and try again.';
      }
    });
  }
}
