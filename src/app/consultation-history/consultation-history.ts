import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-consultation-history',
  imports: [RouterLink],
  templateUrl: './consultation-history.html',
  styleUrl: './consultation-history.css',
})
export class ConsultationHistory {
  private apiService = inject(Api);
  private route = inject(ActivatedRoute);

  subscriptions: Subscription[] = [];

  error = signal('');

  consultations = signal<any[]>([]);
  appointmentId = signal<string | null>(null);

  ngOnInit(): void {
    const subscription = this.route.queryParamMap.subscribe((params) => {
      this.appointmentId.set(params.get('appointmentId'));
      this.fetchConsultationHistory();
    });
    this.subscriptions.push(subscription);
  }

  fetchConsultationHistory(): void {
    this.error.set('');

    if (this.appointmentId()) {
      // Fetch consultation for specific appointment
      const subscription = this.apiService
        .getConsultationByAppointmentId(this.appointmentId()!)
        .subscribe({
          next: (response: any) => {
            if (response.statusCode === 200) {
              this.consultations.set([response.data]);
            }
          },
          error: (error: any) => {
            this.error.set(error.error?.message || 'Failed to load consultation details');
          },
        });
      this.subscriptions.push(subscription);
    } else {
      // Fetch all consultation history
      const subscription = this.apiService.getConsultationHistoryForPatient().subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.consultations.set(response.data);
          }
        },
        error: (error: any) => {
          this.error.set(error.error?.message || 'Failed to load consultation history');
        },
      });
      this.subscriptions.push(subscription);
    }
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

  getPageTitle(): string {
    return this.appointmentId() ? 'Consultation Notes' : 'Consultation History';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
