import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../service/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css',
})
export class DoctorProfile {
  private apiService = inject(Api);
  private router = inject(Router);

  subscriptions: Subscription[] = [];

  error = signal('');

  userData = signal<any | null>(null);
  doctorData = signal<any | null>(null);

  uploading = signal(false);
  uploadError = signal('');
  uploadSuccess = signal('');

  ngOnInit(): void {
    this.fetchDoctorData();
  }

  fetchDoctorData(): void {
    this.error.set('');

    const subscription = this.apiService.getMyUserDetails().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.userData.set(response.data);
          this.fetchDoctorProfile();
        }
      },
      error: (error: any) => {
        this.error.set('Failed to load profile data');
        console.error('Error fetching doctor profile:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  fetchDoctorProfile(): void {
    const subscription = this.apiService.getMyDoctorProfile().subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.doctorData.set(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error fetching doctor profile:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  handleUpdateProfile(): void {
    this.router.navigate(['/doctor/update-profile']);
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
          this.fetchDoctorData();
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

  formatSpecialization(spec: string | undefined): string {
    if (!spec) return 'Not specified';
    return spec
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
