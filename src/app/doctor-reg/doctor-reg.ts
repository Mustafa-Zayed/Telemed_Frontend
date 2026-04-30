import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-reg',
  imports: [FormsModule, RouterLink],
  templateUrl: './doctor-reg.html',
  styleUrl: './doctor-reg.css',
})
export class DoctorReg {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  specializations = signal<string[]>([]);
  formData = signal({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialization: '',
    roles: ['DOCTOR'], // to register a doctor, you need to specify it explicitly.
  });

  error = signal('');
  success = signal('');

  ngOnInit(): void {
    this.fetchSpecializations();
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

  // Method to format specialization display
  formatSpecialization(spec: string): string {
    return spec.replace(/_/g, ' ');
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    if (!this.formData().specialization) {
      this.error.set('Please select a specialization');
      return;
    }

    const subscription = this.apiService.register(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Doctor registration successful! You can now login.');
          this.formData.set({
            name: '',
            email: '',
            password: '',
            licenseNumber: '',
            specialization: '',
            roles: ['DOCTOR'],
          });
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
