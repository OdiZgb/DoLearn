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
import { SessionDto } from './session.dto';

interface CalendarDay {
  date: Date;
  sessions: SessionDto[];
  isCurrentMonth: boolean;
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
  readonly REQUIRED_SESSIONS = 10;

  course!: Course;
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled' = 'not-enrolled';
  isEnrollmentLoading = false;
  userRole?: string;
  userId?: number;
  viewMode: 'calendar' | 'list' = 'calendar';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  currentMonth: Date = new Date();
  selectedSessions: Set<number> = new Set();
  sessionDetails = new Map<number, SessionDto>();
  allSessions: SessionDto[] = [];
  selectedDay?: CalendarDay;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.coursesService.getCourseSessions(id).subscribe(sessions => {
      // Convert string dates to Date objects
      const parsedSessions = sessions.map(s => ({
        ...s,
        start: new Date(s.start),
        finish: new Date(s.finish)
      }));
      
      this.sessionDetails = new Map(parsedSessions.map(s => [s.id, s]));
      this.allSessions = parsedSessions;
      this.generateCalendar(); // Regenerate calendar after sessions load
    });
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
      error: (err) => console.error('Failed to load course', err)
    });
  }

  private checkEnrollmentStatus(courseId: number): void {
    this.coursesService.getEnrollmentStatus(courseId).subscribe({
      next: (status) => this.enrollmentStatus = status
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    // Previous month days
    for (let i = startDay; i > 0; i--) {
      days.push(this.createCalendarDay(new Date(year, month, 1 - i), false));
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(this.createCalendarDay(new Date(year, month, i), true));
    }

    // Next month days
    while (days.length < 42) {
      days.push(this.createCalendarDay(
        new Date(year, month + 1, days.length - lastDay.getDate() + 1), 
        false
      ));
    }

    this.calendarDays = days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    return {
      date,
      sessions: this.getSessionsForDate(date),
      isCurrentMonth,
      isToday: this.isSameDate(date, today)
    };
  }

  private getSessionsForDate(date: Date): SessionDto[] {
    return this.allSessions.filter(session => {
      const sessionDate = new Date(session.start);
      return sessionDate.getFullYear() === date.getFullYear() &&
             sessionDate.getMonth() === date.getMonth() &&
             sessionDate.getDate() === date.getDate();
    });
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  toggleSession(session: SessionDto): void {
    if (!this.isSessionAvailable(session)) return;
    
    if (this.selectedSessions.has(session.id)) {
      this.selectedSessions.delete(session.id);
    } else {
      if (this.selectedSessions.size >= this.REQUIRED_SESSIONS) {
        this.snackBar.open(`Please select exactly ${this.REQUIRED_SESSIONS} sessions`, 'Dismiss');
        return;
      }
      this.selectedSessions.add(session.id);
    }
  }

  handleDayClick(day: CalendarDay): void {
    this.selectedDay = day;
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
    this.selectedDay = undefined;
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
    this.selectedDay = undefined;
  }

  enroll(): void {
    if (!this.userId || this.selectedSessions.size !== this.REQUIRED_SESSIONS) return;
    
    const confirm = window.confirm(`You're enrolling in ${this.REQUIRED_SESSIONS} sessions. Confirm?`);
    if (!confirm) return;

    this.isEnrollmentLoading = true;
    this.coursesService.enrollWithSessions(
      this.course.id,
      Array.from(this.selectedSessions)
    ).pipe(
      finalize(() => this.isEnrollmentLoading = false)
    ).subscribe({
      next: () => {
        this.enrollmentStatus = 'pending';
        this.selectedSessions.clear();
        this.snackBar.open(`Successfully enrolled in ${this.REQUIRED_SESSIONS} sessions!`, 'Dismiss', { duration: 3000 });
        this.generateCalendar();
      },
      error: (err) => this.snackBar.open(err.error || 'Enrollment failed', 'Dismiss')
    });
  }

  isSessionAvailable(session: SessionDto): boolean {
    return session.reserved < session.capacity && !session.isCanceled;
  }

  isDaySelected(day: CalendarDay): boolean {
    return day.sessions.some(s => this.selectedSessions.has(s.id));
  }

  calculateTotalHours(): number {
    return this.allSessions.reduce((total, session) => {
      const start = new Date(session.start).getTime();
      const end = new Date(session.finish).getTime();
      return total + Math.round((end - start) / (1000 * 60 * 60));
    }, 0);
  }

  canEnroll(): boolean {
    return this.userRole === 'Student' && 
           this.enrollmentStatus === 'not-enrolled' &&
           this.selectedSessions.size === this.REQUIRED_SESSIONS;
  }

  // Date status helpers
  isPastSession(date: Date): boolean {
    return new Date(date) < new Date();
  }

  isCurrentSession(date: Date): boolean {
    const now = new Date();
    return new Date(date) <= now && now <= new Date(date.getTime() + (5 * 60 * 60 * 1000));
  }

  isFutureSession(date: Date): boolean {
    return new Date(date) > new Date();
  }
}