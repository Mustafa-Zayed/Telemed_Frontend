import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Reg } from './reg/reg';

export const routes: Routes = [
  // AUTH ROUTES
  { path: 'register', component: Reg },

  { path: 'home', redirectTo: '' },
  { path: '', component: Home },
];
