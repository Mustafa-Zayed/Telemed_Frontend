import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';

@Component({
  selector: 'app-reg',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reg.html',
  styleUrl: './reg.css',
})
export class Reg {
  formData = signal({
    name: '',
    email: '',
    password: '', // if we don't send the role property, it's PATIENT by default in the backend
  });

  error = signal('');
  success = signal('');

  private apiService = inject(Api);
  private router = inject(Router);

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    this.apiService.register(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Registration successful! You can now login.');
          this.formData.set({ name: '', email: '', password: '' });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        } else {
          this.error.set(response.message || 'Registration failed');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred during registration');
      },
    });
  }
}
