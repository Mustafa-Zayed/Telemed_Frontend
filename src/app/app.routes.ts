import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Reg } from './reg/reg';
import { DoctorReg } from './doctor-reg/doctor-reg';

export const routes: Routes = [
  // AUTH ROUTES
  { path: 'register', component: Reg },
  { path: 'register-doctor', component: DoctorReg },

  { path: 'home', redirectTo: '' },
  { path: '', component: Home },
];
