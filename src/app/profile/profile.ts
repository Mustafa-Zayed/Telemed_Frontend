import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private apiService = inject(Api);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  userData = signal<any | null>(null);
  patientData = signal<any | null>(null);
  error = signal('');
  uploading = signal(false);
  uploadError = signal('');
  uploadSuccess = signal('');

  ngOnInit(): void {
    this.fetchUserData();
  }

  // Account Information
  fetchUserData(): void {
    this.error.set('');
    const subscription = this.apiService.getMyUserDetails().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.userData.set(response.data);

          // Fetch patient profile if user is a patient
          if (this.userData()?.roles?.some((role: any) => role.name === 'PATIENT')) {
            this.fetchPatientProfile();
          }
        } else {
          this.error.set('Failed to load user data');
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load profile data');
        console.error('Error fetching profile:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  // Medical Information
  fetchPatientProfile(): void {
    const subscription = this.apiService.getMyPatientProfile().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.patientData.set(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error fetching patient profile:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  handleUpdateProfile(): void {
    this.router.navigate(['/update-profile']);
  }

  handleUpdatePassword(): void {
    this.router.navigate(['/update-password']);
  }

  handleProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.uploadError.set('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('File size must be less than 5MB');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set('');

    const subscription = this.apiService.uploadProfilePicture(file).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.uploadSuccess.set('Profile picture updated successfully!');
          // Refresh user data to get the new profile picture URL
          this.fetchUserData();
          // Clear the file input
          event.target.value = '';
        } else {
          this.uploadError.set(response.message || 'Failed to upload profile picture');
        }

        this.uploading.set(false);
      },
      error: (error: any) => {
        this.uploadError.set(
          error.error?.message || 'An error occurred while uploading the picture',
        );
        this.uploading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatBloodGroup(bloodGroup: string): string {
    if (!bloodGroup) return 'Not provided';
    return bloodGroup.replace(/_/g, ' ');
  }

  // Construct full URL for profile picture
  getProfilePictureUrl(): string | null {
    if (!this.userData()?.profilePictureUrl) return null;
    return this.userData().profilePictureUrl;
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    const placeholder = event.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  get rolesDisplay(): string {
    if (!this.userData()?.roles?.length) return 'Not provided';
    return this.userData()
      .roles.map((role: any) => role.name)
      .join(', ');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
