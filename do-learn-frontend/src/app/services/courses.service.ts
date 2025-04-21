import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Course } from '../models/Course';
import { CourseResponse } from '../models/CourseResponse';
import { SessionDto } from '../features/courses/session.dto';

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
  getEnrolledCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrolled`);
  }
  
  getCreatedCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/created`);
  }
  enrollWithSessions(courseId: number, sessionIds: number[]): Observable<any> {
    return this.http.post(`/api/courses/enroll-with-sessions`, {
      courseId,
      selectedSessionIds: sessionIds
    });
  }
  getCourseSessions(courseId: number): Observable<SessionDto[]> {
    return this.http.get<any>(`${this.apiUrl}/${courseId}`).pipe(
      map(response => {
        // Create proper session objects with UTC dates
        return response.sessionStartTimes.map((start: string, index: number) => {
          const startDate = new Date(start);
          const endDate = new Date(response.sessionEndTimes[index]);
          
          return {
            id: index + 1,
            start: new Date(Date.UTC(
              startDate.getUTCFullYear(),
              startDate.getUTCMonth(),
              startDate.getUTCDate(),
              startDate.getUTCHours(),
              startDate.getUTCMinutes()
            )),
            finish: new Date(Date.UTC(
              endDate.getUTCFullYear(),
              endDate.getUTCMonth(),
              endDate.getUTCDate(),
              endDate.getUTCHours(),
              endDate.getUTCMinutes()
            )),
            reserved: 0,
            capacity: 20,
            isCanceled: false
          };
        });
      })
    );
  }
}
