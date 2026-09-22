import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  submitted = false;
  success = false;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    this.submitted = true;
    this.success = false;
    this.loading = true;
    this.error = '';
    this.authService.signup(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.router.navigate(['/main']);
      },
      error: error => {
        this.loading = false;
        this.error = error.name === 'TimeoutError'
          ? 'El servidor tardo demasiado. Verifica que MongoDB y el backend esten activos.'
          : error.error?.detail || 'No se pudo crear la cuenta.';
      }
    });
  }
}