import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../service/api';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-appointment',
  imports: [FormsModule],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.css',
})
export class BookAppointment {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    doctorId: '',
    purposeOfAppointment: '',
    initialSymptoms: '',
    startTime: '',
  });

  error = signal('');
  success = signal('');

  doctors = signal<any[]>([]);

  ngOnInit(): void {
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    const subscription = this.apiService.getAllDoctors().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.doctors.set(response.data);
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load doctors list');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    // Validation
    if (!this.formData().doctorId) {
      this.error.set('Please select a doctor');
      return;
    }

    if (!this.formData().startTime) {
      this.error.set('Please select appointment date and time');
      return;
    }

    // Convert local datetime to ISO format
    const appointmentData = {
      ...this.formData(),
      doctorId: parseInt(this.formData().doctorId),
      startTime: new Date(this.formData().startTime).toISOString(),
    };

    const subscription = this.apiService.bookAppointment(appointmentData).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Appointment booked successfully!');
          console.log('Appointment booked successfully');
          this.formData.set({
            doctorId: '',
            purposeOfAppointment: '',
            initialSymptoms: '',
            startTime: '',
          });

          setTimeout(() => {
            this.router.navigate(['/my-appointments']);
          }, 2000);
        } else {
          this.error.set(response.message || 'Failed to book appointment');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while booking appointment');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleCancel(): void {
    this.router.navigate(['/profile']);
  }

  formatSpecialization(specialization: string | undefined): string {
    if (!specialization) return '';
    return specialization.replace(/_/g, ' ');
  }

  formatDoctorName(doctor: any): string {
    if (doctor.firstName && doctor.lastName) {
      return `Dr. ${doctor.firstName} ${doctor.lastName} - ${this.formatSpecialization(doctor.specialization)}`;
    }
    return `Dr. ${doctor.user?.name} - ${this.formatSpecialization(doctor.specialization) || 'General Practice'}`;
  }

  // Get minimum datetime (current time)
  getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
