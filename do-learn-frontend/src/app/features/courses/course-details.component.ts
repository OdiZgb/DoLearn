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
  isFull: boolean; // Add this
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
  readonly REQUIRED_SESSIONS = 5;
  selectedDays: Set<string> = new Set(); // Stores dates as ISO strings

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
      this.sessionDetails = new Map(sessions.map(s => [s.id, s]));
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
    
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    // Previous month
    for (let i = startDay; i > 0; i--) {
      days.push(this.createCalendarDay(new Date(year, month, 1 - i), false));
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(this.createCalendarDay(new Date(year, month, i), true));
    }

    // Next month
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
  const sessions = this.getSessionsForDate(date);
  
  return {
      date,
      isCurrentMonth,
      sessions,
      isToday: this.isSameDate(date, today),
      isFull: sessions.length > 0 && sessions.every(s => !this.isSessionAvailable(s))
  };
}
  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }
  private getSessionsForDate(date: Date): SessionDto[] {
    return Array.from(this.sessionDetails.values()).filter(session => 
      this.isSameDate(new Date(session.start), date)
    );
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
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }

  handleDayClick(day: CalendarDay): void {
    const dateStr = day.date.toISOString();
    
    if (this.selectedDays.has(dateStr)) {
      this.selectedDays.delete(dateStr);
      // Remove all sessions for this day
      day.sessions.forEach(session => this.selectedSessions.delete(session.id));
    } else {
      this.selectedDays.add(dateStr);
      // Add all available sessions for this day
      day.sessions.forEach(session => {
        if (this.isSessionAvailable(session)) {
          this.selectedSessions.add(session.id);
        }
      });
    }
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
        error: (err) => {
            this.snackBar.open(err.error || 'Enrollment failed', 'Dismiss');
        }
    });
}
hasSelectedSessions(day: CalendarDay): boolean {
  return day.sessions.some(session => 
    this.selectedSessions.has(session.id) && this.isSessionAvailable(session)
  );
}
  isSessionAvailable(session: SessionDto): boolean {
    return session.reserved < session.capacity && !session.isCanceled;
  }
  canEnroll(): boolean {
    return this.userRole === 'Student' && 
           this.enrollmentStatus === 'not-enrolled' &&
           this.selectedSessions.size === this.REQUIRED_SESSIONS;
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
  isDaySelected(day: CalendarDay): boolean {
    return this.selectedDays.has(day.date.toISOString());
  }
  
}