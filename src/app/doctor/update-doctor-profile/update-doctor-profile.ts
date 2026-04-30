import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../service/api';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-doctor-profile',
  imports: [FormsModule],
  templateUrl: './update-doctor-profile.html',
  styleUrl: './update-doctor-profile.css',
})
export class UpdateDoctorProfile {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    firstName: '',
    lastName: '',
    specialization: '',
  });

  specializations = signal<string[]>([]);

  error = signal('');
  success = signal('');

  ngOnInit(): void {
    this.fetchProfileData();
    this.fetchSpecializations();
  }

  fetchProfileData(): void {
    const subscription = this.apiService.getMyDoctorProfile().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          const doctorData = response.data;
          this.formData.set({
            firstName: doctorData.firstName || '',
            lastName: doctorData.lastName || '',
            specialization: doctorData.specialization || '',
          });
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load profile data');
      },
    });
    this.subscriptions.push(subscription);
  }

  fetchSpecializations(): void {
    const subscription = this.apiService.getAllSpecializationEnums().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.specializations.set(response.data);
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load specializations');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleCancel(): void {
    this.router.navigate(['/doctor/profile']);
  }

  formatSpecialization(spec: string): string {
    return spec
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    const subscription = this.apiService.updateMyDoctorProfile(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Profile updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/doctor/profile']);
          }, 2000);
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while updating profile');
      },
    });
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
