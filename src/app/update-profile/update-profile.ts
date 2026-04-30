import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../service/api';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-profile',
  imports: [FormsModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css',
})
export class UpdateProfile {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  formData = signal({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    knownAllergies: '',
    bloodGroup: '',
    genotype: '',
  });

  error = signal('');
  success = signal('');

  bloodGroups = signal<string[]>([]);
  genotypes = signal<string[]>([]);

  ngOnInit(): void {
    this.fetchEnums();
    this.fetchProfileData();
  }

  fetchProfileData(): void {
    this.apiService.getMyPatientProfile().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          const patientData = response.data;

          this.formData.set({
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || '',
            phone: patientData.phone || '',
            dateOfBirth: patientData.dateOfBirth || '',
            knownAllergies: patientData.knownAllergies || '',
            bloodGroup: patientData.bloodGroup || '',
            genotype: patientData.genotype || '',
          });
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load profile data');
      },
    });
  }

  fetchEnums(): void {
    const bloodGroupRequest = this.apiService.getAllBloodGroupEnums();
    const genotypeRequest = this.apiService.getAllGenotypeEnums();

    const subscription = bloodGroupRequest.subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.bloodGroups.set(response.data);
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load blood group options');
      },
    });
    this.subscriptions.push(subscription);

    const genotypeSubscription = genotypeRequest.subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.genotypes.set(response.data);
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load genotype options');
      },
    });
    this.subscriptions.push(genotypeSubscription);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.success.set('');

    if (this.formData().bloodGroup === '') {
      this.error.set('Please select a blood group');
      return;
    }

    if (this.formData().genotype === '') {
      this.error.set('Please select a genotype');
      return;
    }

    const subscription = this.apiService.updateMyPatientProfile(this.formData()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.success.set('Profile updated successfully!');

          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
        } else {
          this.error.set(response.message || 'Failed to update profile');
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'An error occurred while updating profile');
      },
    });
    this.subscriptions.push(subscription);
  }

  formatBloodGroup(group: string): string {
    return group.replace(/_/g, ' ');
  }

  handleCancel(): void {
    this.router.navigate(['/profile']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
