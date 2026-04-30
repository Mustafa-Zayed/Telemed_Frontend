import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-appointments',
  imports: [RouterLink],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css',
})
export class MyAppointments {
  private apiService = inject(Api);

  subscriptions: Subscription[] = [];

  error = signal('');

  appointments = signal<any[]>([]);

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.error.set('');

    const subscription = this.apiService.getMyAppointments().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.appointments.set(response.data);
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load appointments');
      },
    });
    this.subscriptions.push(subscription);
  }

  formatDoctorName(doctor: any): string {
    return doctor.firstName && doctor.lastName
      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
      : `Dr. ${doctor.user?.name}`;
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

  getStatusBadge(status: string): { class: string; text: string } {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      SCHEDULED: { class: 'status-scheduled', text: 'Scheduled' },
      COMPLETED: { class: 'status-completed', text: 'Completed' },
      CANCELLED: { class: 'status-cancelled', text: 'Cancelled' },
      IN_PROGRESS: { class: 'status-in-progress', text: 'In Progress' },
    };

    return statusConfig[status] || { class: 'status-default', text: status };
  }

  handleCancelAppointment(appointmentId: number): void {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    const subscription = this.apiService.cancelAppointment(appointmentId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // Refresh appointments list
          this.fetchAppointments();
        } else {
          this.error.set('Failed to cancel appointment');
        }
      },
      error: (error: any) => {
        this.error.set('Failed to cancel appointment');
      },
    });
    this.subscriptions.push(subscription);
  }

  formatSpecialization(specialization: string | undefined): string {
    if (!specialization) return '';
    return specialization.replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
