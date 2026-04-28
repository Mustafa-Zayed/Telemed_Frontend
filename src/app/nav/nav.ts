import { Component } from '@angular/core';
import { Api } from '../service/api';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  isAuthenticated = false;
  isPatient = false;
  isDoctor = false;

  showLogoutModal = false;

  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private apiService: Api,
  ) {
    // Subscribes to the router's stream of events.
    this.routerSubscription = this.router.events
      // Filters the events to only proceed when a navigation has successfully ended (NavigationEnd).
      // This ensures the authentication check only runs after a new route has been loaded.
      // So this avoids running logic during: navigation start, guards execution and errors
      .pipe(filter((event) => event instanceof NavigationEnd))
      // When a successful navigation occurs, this callback is executed.
      .subscribe(() => {
        // Calls the method to re-check and update the component's properties
        // related to the user's authentication and role (patient/doctor) status.
        this.checkAuthStatus();
      });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.apiService.isAuthenticated();
    this.isPatient = this.apiService.isPatient();
    this.isDoctor = this.apiService.isDoctor();
  }

  handleLogoutClick(): void {
    this.showLogoutModal = true;
  }

  handleConfirmLogout(): void {
    this.apiService.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/']);
    this.checkAuthStatus();
  }

  handleCancelLogout(): void {
    this.showLogoutModal = false;
  }

  isActiveLink(path: string): string {
    return this.router.url === path ? 'nav-link active' : 'nav-link';
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      // It's crucial to unsubscribe from the router events to prevent memory leaks
      // when the component is destroyed.
      this.routerSubscription.unsubscribe();
    }
  }
}
