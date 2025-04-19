import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Course } from '../../models/Course';
import { CoursesService } from '../../services/courses.service';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
@Component({
  selector: 'app-course-details',
  standalone: true,
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ]
})
export class CourseDetailsComponent implements OnInit {
  course!: Course;
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled' = 'not-enrolled';
  isEnrollmentLoading = false;
  userRole?: string;
  userId?: number;
  viewMode: 'calendar' | 'list' = 'calendar';

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role;
      this.userId = user?.id;
    });

    this.coursesService.getCourse(id).subscribe({
      next: (course:any) => {
        this.course = course;

        this.coursesService.getEnrollmentStatus(course.id).subscribe({
          next: (status:any) => this.enrollmentStatus = status
        });
      },
      error: (err:any) => console.error('Failed to load course', err)
    });
  }

  enroll() {
    if (!this.userId) return;
    this.isEnrollmentLoading = true;

    this.coursesService.enrollInCourse(this.course.id).pipe(
      finalize(() => this.isEnrollmentLoading = false)
    ).subscribe({
      next: () => {
        this.enrollmentStatus = 'pending';
        this.snackBar.open('Enrollment request sent!', 'Dismiss', { duration: 3000 });
      },
      error: (err:any) => {
        this.snackBar.open(err.error || 'Enrollment failed', 'Dismiss');
      }
    });
  }

  canEnroll(): boolean {
    return this.userRole === 'Student' && this.enrollmentStatus === 'not-enrolled';
  }
  groupSessionsByWeek() {
    const weeks = new Map<number, any>();
    this.course.sessionStartTimes?.forEach((dateStr:any) => {
      const date = new Date(dateStr);
      const weekNumber = this.getWeekNumber(date);
      
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, {
          weekNumber,
          dates: []
        });
      }
      weeks.get(weekNumber).dates.push(date);
    });
    return Array.from(weeks.values());
  }
  
  getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
  
  isPastSession(date: Date) {
    return new Date(date) < new Date();
  }
  
  isCurrentSession(date: Date) {
    const now = new Date();
    return new Date(date) <= now && now <= new Date(date.getTime() + (5 * 60 * 60 * 1000));
  }
  
  isFutureSession(date: Date) {
    return new Date(date) > new Date();
  }
  
  calculateTotalHours() {
    return this.course.sessionStartTimes?.reduce((acc:any, start:any, i:any) => {
      const end = new Date(this.course.sessionEndTimes[i]);
      const startDate = new Date(start);
      return acc + Math.round((end.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    }, 0) || 0;
  }
  
  getEndTime(startDate: string) {
    const index = this.course.sessionStartTimes.indexOf(startDate);
    return this.course.sessionEndTimes[index];
  }
}
