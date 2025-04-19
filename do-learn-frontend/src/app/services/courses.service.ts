import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Course } from '../models/Course';
import { CourseResponse } from '../models/CourseResponse';

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

  createCourse(courseData: any) {
    return this.http.post(this.apiUrl, courseData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
  createCourseWithImage(fd: FormData): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(this.apiUrl, fd);
  }
  getEnrollmentStatus(courseId: number): Observable<'enrolled' | 'pending' | 'not-enrolled'> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/${courseId}/enrollment-status`)
      .pipe(map(res => res.status as any));
  }
  

}
