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

  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  setRole(role: 'Admin' | 'User') {
    this.selectedRole = role;
    this.errorMessage = ''; // Clear error when switching roles
  }

  onSubmit() {
    this.errorMessage = ''; // Reset error

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password,
      role: this.selectedRole
    };

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        if (response && (response.token || response.success)) {
          // Save token if present
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          const route = this.selectedRole === 'Admin' ? '/admin/dashboard' : '/user/dashboard';
          this.router.navigate([route]);
        } else {
          this.errorMessage = response?.message || 'Invalid credentials';
        }
      },
      error: (err: any) => {
        console.error('Login error', err);
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      }
    });
  }
}
