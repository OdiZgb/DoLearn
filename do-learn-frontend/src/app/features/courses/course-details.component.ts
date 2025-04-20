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
import { MatButtonToggleModule } from '@angular/material/button-toggle';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isSession: boolean;
  isAvailable: boolean;
  isToday: boolean;
}

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
    MatButtonToggleModule,
    DatePipe
  ]
})
export class CourseDetailsComponent implements OnInit {
  course!: Course;
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled' = 'not-enrolled';
  isEnrollmentLoading = false;
  userRole?: string;
  userId?: number;
  viewMode: 'calendar' | 'list' = 'calendar';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  currentMonth: Date = new Date();

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
      next: (course: any) => {
        this.course = course;
        this.currentMonth = new Date(course.startDate);
        this.generateCalendar();
        this.checkEnrollmentStatus(course.id);
      },
      error: (err: any) => console.error('Failed to load course', err)
    });
  }

  private checkEnrollmentStatus(courseId: number): void {
    this.coursesService.getEnrollmentStatus(courseId).subscribe({
      next: (status: any) => this.enrollmentStatus = status
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const sessionDates = this.course.sessionStartTimes?.map((d: string) => new Date(d).toDateString()) || [];
    
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    // Previous month
    for (let i = startDay; i > 0; i--) {
      days.push(this.createCalendarDay(new Date(year, month, 1 - i), false, sessionDates));
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(this.createCalendarDay(new Date(year, month, i), true, sessionDates));
    }

    // Next month
    while (days.length < 42) {
      days.push(this.createCalendarDay(new Date(year, month + 1, days.length - lastDay.getDate() + 1), false, sessionDates));
    }

    this.calendarDays = days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean, sessionDates: string[]): CalendarDay {
    return {
      date,
      isCurrentMonth,
      isSession: sessionDates.includes(date.toDateString()),
      isAvailable: Math.random() > 0.5, // Replace with actual availability check
      isToday: date.toDateString() === new Date().toDateString()
    };
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }

  handleDayClick(day: CalendarDay): void {
    if (day.isSession) {
      this.snackBar.open(
        day.isAvailable ? 'Available session' : 'Session occupied',
        'Dismiss', { duration: 2000 }
      );
    }
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
      error: (err: any) => {
        this.snackBar.open(err.error || 'Enrollment failed', 'Dismiss');
      }
    });
  }

  canEnroll(): boolean {
    return this.userRole === 'Student' && this.enrollmentStatus === 'not-enrolled';
  }

  // Existing date methods
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
    return this.course.sessionStartTimes?.reduce((acc: any, start: any, i: any) => {
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