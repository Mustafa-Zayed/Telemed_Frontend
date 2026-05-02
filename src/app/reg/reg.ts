import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reg',
  imports: [FormsModule, RouterLink],
  templateUrl: './reg.html',
  styleUrl: './reg.css',
})
export class Reg {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    name: '',
    email: '',
    password: '', // if we don't send the role property, it's PATIENT by default in the backend
  });

  error = signal('');
  success = signal('');

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    const subscription = this.apiService.register(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Registration successful! You can now login.');
          this.formData.set({ name: '', email: '', password: '' });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error.set(response.message || 'Registration failed');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred during registration');
      },
    });
    this.subscriptions.push(subscription);
  }

  onGoogleLogin = (): void => {
    window.location.href = 'http://localhost:8080/api/auth/login/google';
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
