import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();
  constructor(private http: HttpClient) {
    this.checkAuthState();
    
  }
  
  googleLogin(idToken: string) {
    return this.http.post<{ token: string; expiration: string }>('/api/auth/google-login', {
      idToken
    });
  }
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isAuthenticatedSubject.asObservable();



  private checkAuthState() {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

 
 
  register(data: { email: string; password: string; fullName: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
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
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  fetchUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUser.next(user))
    );
  }
    getUser(id:number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/`+id);
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
