import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Reg } from './reg/reg';
import { DoctorReg } from './doctor-reg/doctor-reg';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { UpdateProfile } from './update-profile/update-profile';

export const routes: Routes = [
  // AUTH ROUTES
  { path: 'register', component: Reg },
  { path: 'register-doctor', component: DoctorReg },
  { path: 'login', component: Login },

  { path: 'home', redirectTo: '' },
  { path: '', component: Home },

  { path: 'profile', component: Profile },
  { path: 'update-profile', component: UpdateProfile },
];
