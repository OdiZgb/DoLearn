import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:5055/api/Courses'; // Hell yeah we remember

  constructor(private http: HttpClient) {}

  // Get all courses
  getCourses(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Get course by ID
  getCourse(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new course
  createCourse(coursePayload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, coursePayload);
  }

  // Enroll in a course
  enrollInCourse(courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${courseId}/enroll`, {});
  }

  // Withdraw from a course
  withdrawFromCourse(courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${courseId}/withdraw`, {});
  }

  // Cancel session (admin)
  cancelSession(sessionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancel-session/${sessionId}`, {});
  }
}
