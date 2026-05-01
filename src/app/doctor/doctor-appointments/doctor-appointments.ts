import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-appointments',
  imports: [RouterLink],
  templateUrl: './doctor-appointments.html',
  styleUrl: './doctor-appointments.css',
})
export class DoctorAppointments {
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

  handleCompleteAppointment(appointmentId: number): void {
    if (!window.confirm('Are you sure you want to mark this appointment as completed?')) {
      return;
    }

    const subscription = this.apiService.completeAppointment(appointmentId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // Refresh appointments list
          this.fetchAppointments();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.error.set('Error updating the appointment status');
      },
    });
    this.subscriptions.push(subscription);
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
        }
      },
      error: (error: any) => {
        this.error.set('Error Cancelling the appointment');
      },
    });
    this.subscriptions.push(subscription);
  }

  formatPatientInfo(patient: any): string {
    if (!patient.firstName || !patient.lastName) {
      return `${patient.user.name} (${patient.user?.email})`;
    }
    return `${patient.firstName} ${patient.lastName} (${patient.user?.email})`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  }

  formatBloodGroup(bloodGroup: string | undefined): string {
    if (!bloodGroup) return 'Not provided';
    return bloodGroup.replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
