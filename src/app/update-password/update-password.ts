import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../service/api';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-password',
  imports: [FormsModule],
  templateUrl: './update-password.html',
  styleUrl: './update-password.css',
})
export class UpdatePassword {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  error = signal('');
  success = signal('');

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    // Validation
    if (this.formData().newPassword !== this.formData().confirmPassword) {
      this.error.set('New password and confirm password do not match');
      return;
    }

    if (this.formData().newPassword.length < 4) {
      this.error.set('New password must be at least 4 characters long');
      return;
    }

    const updatePasswordRequest = {
      oldPassword: this.formData().oldPassword,
      newPassword: this.formData().newPassword,
    };

    const subscription = this.apiService.updatePassword(updatePasswordRequest).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Password updated successfully!');
          this.formData.set({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setTimeout(() => {
            if (this.apiService.isDoctor()) this.router.navigate(['/doctor/profile']);
            else if (this.apiService.isPatient()) this.router.navigate(['/profile']);
          }, 2000);
        } else {
          this.error.set(response.message || 'Failed to update password');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while updating password');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleCancel(): void {
    if (this.apiService.isDoctor()) this.router.navigate(['/doctor/profile']);
    else if (this.apiService.isPatient()) this.router.navigate(['/profile']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
