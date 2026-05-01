import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../service/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-consultation',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-consultation.html',
  styleUrl: './create-consultation.css',
})
export class CreateConsultation {
  private apiService = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    appointmentId: '',
    subjectiveNotes: '',
    objectiveFindings: '',
    assessment: '',
    plan: '',
  });

  appointment = signal<any | null>(null);
  appointmentId = signal<string | null>(null);

  error = signal('');
  success = signal('');

  ngOnInit(): void {
    const subscription = this.route.queryParamMap.subscribe((params) => {
      this.appointmentId.set(params.get('appointmentId'));
      if (this.appointmentId()) {
        this.fetchAppointmentDetails();
      } else {
        this.error.set('No Appointment ID Provided');
      }
    });
    this.subscriptions.push(subscription);
  }

  fetchAppointmentDetails(): void {
    const subscription = this.apiService.getMyAppointments().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          const foundAppointment = response.data.find(
            (appt: any) => appt.id === parseInt(this.appointmentId()!),
          );
          if (foundAppointment) {
            this.appointment.set(foundAppointment);
            this.formData.set({
              ...this.formData(),
              appointmentId: this.appointmentId()!,
            });
          }
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load appointment details');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    // Validation
    if (
      !this.formData().subjectiveNotes ||
      !this.formData().objectiveFindings ||
      !this.formData().assessment ||
      !this.formData().plan
    ) {
      this.error.set('All fields are required');
      return;
    }

    const consultationData = {
      ...this.formData(),
      appointmentId: parseInt(this.formData().appointmentId),
    };

    const subscription = this.apiService.createConsultation(consultationData).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Consultation created successfully!');
          setTimeout(() => {
            this.router.navigate(['/doctor/appointments']);
          }, 2000);
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while creating consultation');
      },
    });
    this.subscriptions.push(subscription);
  }

  handleCancel(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
