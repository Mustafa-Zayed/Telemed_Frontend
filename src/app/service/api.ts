import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private API_BASE_URL = 'http://localhost:8080/api';

  private http = inject(HttpClient);

  getHeader(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  saveAuthData(token: string, roles: string[]): void {
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
  }

  hasRole(role: string): boolean {
    // 1. Retrieve the roles string from localStorage.
    const rolesString = localStorage.getItem('roles');

    // 2. If the string is not null or undefined, parse it into a string array.
    //    Otherwise, treat it as null (no roles stored).
    const roles: string[] | null = rolesString ? JSON.parse(rolesString) : null;

    // 3. Check if the roles array exists and includes the specified role.
    return roles ? roles.includes(role) : false;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  isDoctor(): boolean {
    return this.hasRole('DOCTOR');
  }

  isPatient(): boolean {
    return this.hasRole('PATIENT');
  }

  // AUTH & USERS MANAGEMENT METHODS

  register(body: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/register`, body);
  }

  login(body: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/login`, body);
  }

  forgetPassword(body: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/forgot-password`, body);
  }

  resetPassword(body: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/reset-password`, body);
  }

  // USERS MANAGEMENT METHODS

  getMyUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/users/me`, {
      headers: this.getHeader(),
    });
  }

  getUserById(userId: number | string): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/users/by-id/${userId}`, {
      headers: this.getHeader(),
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/users/all`, {
      headers: this.getHeader(),
    });
  }

  updatePassword(updatePasswordRequest: any): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/users/update-password`, updatePasswordRequest, {
      headers: this.getHeader(),
    });
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData: FormData = new FormData(); // FormData is a browser API used to construct form data for sending to a server, particularly useful for uploading files and binary data.
    formData.append('file', file);

    const headers = this.getHeader();

    return this.http.put(`${this.API_BASE_URL}/users/profile-picture`, formData, { headers });
  }

  // --- PATIENTS ACCOUNT MANAGEMENT ---

  getMyPatientProfile(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/patients/me`, { headers: this.getHeader() });
  }

  updateMyPatientProfile(body: any): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/patients/me`, body, { headers: this.getHeader() });
  }

  getPatientById(patientId: number | string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/patients/${patientId}`, {
      headers: this.getHeader(),
    });
  }

  getAllGenotypeEnums(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/patients/genotype`, { headers: this.getHeader() });
  }

  getAllBloodGroupEnums(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/patients/bloodgroup`, { headers: this.getHeader() });
  }

  // --- DOCTORS ACCOUNT MANAGEMENT ---

  getMyDoctorProfile(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/doctors/me`, { headers: this.getHeader() });
  }

  updateMyDoctorProfile(body: any): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/doctors/me`, body, { headers: this.getHeader() });
  }

  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/doctors`, { headers: this.getHeader() });
  }

  getDoctorById(doctorId: number | string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/doctors/${doctorId}`, { headers: this.getHeader() });
  }

  getAllSpecializationEnums(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/doctors/specializations`);
  }

  // --- APPOINTMENT MANAGEMENT ---

  bookAppointment(appointmentDTO: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/appointments`, appointmentDTO, {
      headers: this.getHeader(),
    });
  }

  getMyAppointments(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/appointments`, { headers: this.getHeader() });
  }

  cancelAppointment(appointmentId: number | string): Observable<any> {
    // Angular's HttpClient.put typically requires a body. If your API expects an empty body for this endpoint,
    // you can pass an empty object `{}` as the body.
    return this.http.put(
      `${this.API_BASE_URL}/appointments/cancel/${appointmentId}`,
      {},
      { headers: this.getHeader() },
    );
  }

  completeAppointment(appointmentId: number | string): Observable<any> {
    // Similarly, pass an empty object if no body is required
    return this.http.put(
      `${this.API_BASE_URL}/appointments/complete/${appointmentId}`,
      {},
      { headers: this.getHeader() },
    );
  }

  // --- CONSULTATION MANAGEMENT ---

  createConsultation(consultationDTO: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/consultations`, consultationDTO, {
      headers: this.getHeader(),
    });
  }

  getConsultationByAppointmentId(appointmentId: number | string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/consultations/appointment/${appointmentId}`, {
      headers: this.getHeader(),
    });
  }

  getConsultationHistoryForPatient(patientId?: number | string | null): Observable<any> {
    let params = new HttpParams();
    // Only set the parameter if it's provided, mirroring Axios's graceful handling
    if (patientId) {
      params = params.set('patientId', String(patientId));
    }

    return this.http.get(`${this.API_BASE_URL}/consultations/history`, {
      headers: this.getHeader(),
      params: params,
    });
  }
}
