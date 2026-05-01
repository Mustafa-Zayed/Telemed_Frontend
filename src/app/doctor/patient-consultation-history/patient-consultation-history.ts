import { Component, inject, signal } from '@angular/core';
import { Api } from '../../service/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-consultation-history',
  imports: [],
  templateUrl: './patient-consultation-history.html',
  styleUrl: './patient-consultation-history.css',
})
export class PatientConsultationHistory {
  private apiService = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  consultations = signal<any>([]);
  patient = signal<any>(null);
  patientId = signal<string | null>(null);

  error = signal('');

  ngOnInit(): void {
    const subscription = this.route.queryParamMap.subscribe((params) => {
      this.patientId.set(params.get('patientId'));
      if (this.patientId()) {
        this.fetchConsultationHistory();
      } else {
        this.error.set('No patient ID provided');
      }
    });
    this.subscriptions.push(subscription);
  }

  fetchConsultationHistory(): void {
    this.error.set('');

    const subscription = this.apiService
      .getConsultationHistoryForPatient(this.patientId())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.consultations.set(response.data);

            // If we have consultations, extract patient info
            if (response.data.length > 0) {
              this.patient.set({
                id: this.patientId(),
              });
            }
          }
        },
        error: (error: any) => {
          this.error.set('Failed to load consultation history');
          console.error('Error fetching consultation history:', error);
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

  getTimeAgo(dateTimeString: string): string {
    const now = new Date();
    const consultationDate = new Date(dateTimeString);
    const diffTime = Math.abs(now.getTime() - consultationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  groupConsultationsByDate(consultations: any[]): any {
    const grouped: any = {};

    consultations.forEach((consultation) => {
      const date = new Date(consultation.consultationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(consultation);
    });

    return grouped;
  }

  // NEW METHOD: Convert grouped object to typed array for template
  getGroupedConsultationsArray(): any[] {
    const grouped = this.groupConsultationsByDate(this.consultations());
    return Object.keys(grouped).map((date) => ({
      date,
      consultations: grouped[date],
    }));
  }

  calculateStatistics(consultations: any[]): any {
    const totalConsultations = consultations.length;
    const recentConsultations = consultations.filter((consultation) => {
      const consultationDate = new Date(consultation.consultationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return consultationDate > thirtyDaysAgo;
    }).length;

    return {
      totalConsultations,
      recentConsultations,
    };
  }

  goBackToAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  getGroupedConsultations(): any {
    return this.groupConsultationsByDate(this.consultations());
  }

  getStats(): any {
    return this.calculateStatistics(this.consultations());
  }

  getMostRecentDate(): string {
    if (this.consultations().length > 0) {
      return this.formatDateTime(this.consultations()[0].consultationDate);
    }
    return 'N/A';
  }

  analyzePatterns(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
