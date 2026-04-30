import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private apiService = inject(Api);

  subscriptions: Subscription[] = [];

  formData = signal({
    email: '',
  });

  error = signal('');
  success = signal('');

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    const subscription = this.apiService.forgetPassword(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Password reset instructions have been sent to your email!');
          this.formData.set({ email: '' });
        } else {
          this.error.set(response.message || 'Failed to send reset instructions');
        }
        this.apiService.logout();
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while processing your request');
      },
    });
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
