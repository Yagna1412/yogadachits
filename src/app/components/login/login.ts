import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) { }

  setRole(role: 'Admin' | 'User') {
    this.selectedRole = role;
  }

  onSubmit() {
    // For demo purposes, accept any credentials
    if (this.email && this.password) {
      // In production, you would validate against a backend
      if (this.selectedRole === 'Admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
    }
  }
}
