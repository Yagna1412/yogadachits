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

  errorMessage: string = '';

  constructor(private router: Router) { }

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

    if (this.selectedRole === 'Admin') {
      if (this.email === 'YogadaChits@Admin.com' && this.password === 'Admin123') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage = 'Invalid Admin credentials';
      }
    } else if (this.selectedRole === 'User') {
      if (this.email === 'YogadaChits@User.com' && this.password === 'User123') {
        this.router.navigate(['/user/dashboard']);
      } else {
        this.errorMessage = 'Invalid User credentials';
     
     }
    }
  }
}
