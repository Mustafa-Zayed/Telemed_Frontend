import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private apiService = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    newPassword: '',
    confirmPassword: '',
    code: '',
  });

  error = signal('');
  success = signal('');

  ngOnInit(): void {
    // Get code from query parameters
    const subscription = this.route.queryParamMap.subscribe((params) => {
      const codeFromUrl = params.get('code');
      if (codeFromUrl) {
        this.formData.set({
          ...this.formData(),
          code: codeFromUrl,
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    // Validation
    if (!this.formData().code) {
      this.error.set('Reset code is missing. Please use the link from your email.');

      return;
    }

    if (this.formData().newPassword !== this.formData().confirmPassword) {
      this.error.set('New password and confirm password do not match');

      return;
    }

    if (this.formData().newPassword.length < 4) {
      this.error.set('New password must be at least 4 characters long');

      return;
    }

    const resetData = {
      newPassword: this.formData().newPassword,
      code: this.formData().code,
    };

    const subscription = this.apiService.resetPassword(resetData).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set(
            'Password reset successfully! You can now login with your new password.',
          );
          this.formData.set({
            newPassword: '',
            confirmPassword: '',
            code: this.formData().code, // Keep code for display
          });

          // Redirect to login after 5 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);

          this.apiService.logout();
        } else {
          this.error.set(response.message || 'Failed to reset password');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while resetting your password');
      },
    });
    this.subscriptions.push(subscription);
  }

  // Computed properties for password requirements
  get isPasswordLengthValid(): boolean {
    return this.formData().newPassword.length >= 4;
  }

  get doPasswordsMatch(): boolean {
    return (
      this.formData().newPassword === this.formData().confirmPassword &&
      this.formData().newPassword.length > 0
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
