// dashboard.component.ts
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CoursesService } from '../../../services/courses.service';
import { AuthService } from '../../../auth/auth.service';
import { TimeAgoPipe } from '../../../Shared/time-ago.pipe';
import { TruncatePipe } from '../../messages/chat-contacts/(truncate.pipe';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule,
    TruncatePipe,
    TimeAgoPipe,
    MatProgressSpinnerModule
  ]
})
export class DashboardComponent implements OnDestroy {
  enrolledCourses: any[] = [];
  createdCourses: any[] = [];
  upcomingSessions: any[] = [];
  userReservedSessions: any[] = [];
  userRole: string = '';
  userId?: number;
  isLoading = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.authService.fetchUserProfile().subscribe({
        next: (user) => {
          this.userId = user.id;
          this.userRole = user?.role || '';
          this.loadDashboardData();
        },
        error: (err) => console.error('Failed to fetch user profile:', err)
      })
    );
  }

  private loadDashboardData() {
    this.subscriptions.push(
      this.coursesService.getEnrolledCourses().subscribe({
        next: (enrollments) => {
      const seenCourseIds = new Set<number>();
      this.enrolledCourses = enrollments
        .map((enrollment: any) => ({
          ...enrollment.course,
          enrollmentStatus: enrollment.status
        }))
      .filter((course:any) => {
        if (!course?.id || seenCourseIds.has(course.id)) return false;
        seenCourseIds.add(course.id);
        return true;
      });
          
          // Process sessions from all enrollments
          this.processUserSessions(enrollments);
          
          if (this.userRole === 'Teacher' || this.userRole === 'Admin') {
            this.loadCreatedCourses();
          } else {
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Failed to load enrolled courses', err);
          this.isLoading = false;
        }
      })
    );
  }
formatSessionTime(start: Date, finish: Date): string {
  const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(finish).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${startTime} - ${endTime}`;
}
private processUserSessions(enrollments: any[]) {
  this.userReservedSessions = [];
  this.upcomingSessions = [];
  const now = new Date();

  enrollments.forEach(enrollment => {
    if (enrollment.reservedSessions?.length) {
      enrollment.reservedSessions.forEach((session: any) => {
        const sessionStart = new Date(session.start);
        const sessionEnd = new Date(session.finish);

        // Filter out finished sessions
        if (sessionEnd < now) return;

        const sessionWithDetails = {
          ...session,
          courseId: enrollment.courseId,
          courseTitle: enrollment.course?.title || 'Unknown Course',
          start: sessionStart,
          finish: sessionEnd
        };

        // Add to reserved list only if it's the current user's
        if (this.isUserSession(session, enrollment)) {
          this.userReservedSessions.push(sessionWithDetails);
        }

        // Add to upcoming list
        this.upcomingSessions.push(sessionWithDetails);
      });
    }
  });

  // Sort by start time
  this.upcomingSessions.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Optional: Tag the next session
  if (this.upcomingSessions.length > 0) {
    this.upcomingSessions[0].isNext = true;
  }

  this.isLoading = false;
}

 
  private isUserSession(session: any, enrollment: any): boolean {
    // Check if session belongs to current user's enrollment
    // Based on your data, reservations array might be empty or contain null
    // So we'll consider all sessions in the enrollment as user's sessions
    return enrollment.studentId === this.userId;
  }

  calculateSessionDuration(start: Date, finish: Date): number {
    return Math.round((finish.getTime() - start.getTime()) / (1000 * 60));
  }

  joinSession(url: string): void {
    window.open(url, '_blank');
  }
private loadCreatedCourses() {
    this.subscriptions.push(
      this.coursesService.getCreatedCourses().subscribe({
        next: (courses) => {
          this.createdCourses = courses;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load created courses', err);
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}