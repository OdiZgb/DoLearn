import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5055/api/Auth'; // Update if needed

  constructor(private http: HttpClient) {
    this.checkAuthState();
  }
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isAuthenticatedSubject.asObservable();



  private checkAuthState() {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

 
 
  register(data: { email: string; password: string; fullName: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  

 
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
 
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
