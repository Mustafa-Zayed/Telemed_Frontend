import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    email: '',
    password: '',
  });

  error = signal('');

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');

    const subscription = this.apiService.login(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          const { token, roles } = response.data;

          this.apiService.saveAuthData(token, roles);

          this.router.navigate(['/']);
        } else {
          this.error.set(response.message || 'Login failed');
        }
      },
      error: (error: any) => {
        console.log('ERROR IS: ', error);
        this.error.set(error.error?.message || 'An error occurred during login');
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
