import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommonModule, DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { finalize, Subscription } from 'rxjs';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../auth/auth.service';

import { Course } from '../../models/Course';

import { CoursesService } from '../../services/courses.service';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { SessionDto } from './session.dto';

import { FormsModule } from '@angular/forms';

interface CalendarDay {

  date: Date;

  sessions: SessionDto[];

  isCurrentMonth: boolean;

  isToday: boolean;

}
declare var paypal: any;


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

    DatePipe,

    RouterModule,

    FormsModule 

  ]

})

export class CourseDetailsComponent implements OnInit {

  readonly REQUIRED_SESSIONS = 1;
isPaymentLoading = false;


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

  sessionDetails :any= new Map<number, SessionDto>();

  allSessions:any = [];

  selectedDay?: CalendarDay;

  isLoggedIn = false;



  private authSubscription: Subscription;


userReservedSessions: any[] = [];

  constructor(

    private route: ActivatedRoute,

    private coursesService: CoursesService,

    private authService: AuthService,

    private snackBar: MatSnackBar,

    private router: Router,



  ) {

       this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {

      this.isLoggedIn = loggedIn;

    });



  }

    redirectToRegisterPage(): void {

      this.router.navigate(['/register']);

   }























































getTeacherGradient(id: number): string {

  const hue = id % 360;

  return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 30) % 360}, 70%, 50%))`;

}



getInitials(username: string): string {

  return username.split(' ')

    .map(n => n[0])

    .join('')

    .toUpperCase()

    .substring(0, 2);

}

  ngOnInit(): void {


 setTimeout(() => {
    if (typeof paypal !== 'undefined') {
      this.renderPayPalButton();
    } else {
      console.error('PayPal SDK not loaded!');
    }
  }, 0);
 this.authService.fetchUserProfile().subscribe({

    next: (user) => {

      this.userId = user.id;

      this.userRole = user?.role;



      this.coursesService.getCourseSessions(id).subscribe(sessions => {

        const parsedSessions = sessions.map(s => ({

          ...s,

          start: new Date(s.start),

          finish: new Date(s.finish)

        }));



        this.allSessions = parsedSessions;

        // Filter to only show user's reserved sessions

        this.userReservedSessions = this.allSessions.filter((session:any) => 

          this.hasUserReservation(session)

        );

        this.generateCalendar();

      });

    },

    error: (err) => console.error('Failed to fetch user profile:', err)

  });



    const id = Number(this.route.snapshot.paramMap.get('id'));



    this.coursesService.getCourseSessions(id).subscribe(sessions => {

      const parsedSessions = sessions.map(s => ({

        ...s,

        start: new Date(s.start),

        finish: new Date(s.finish),

        reserved: s.reservations.length // Count actual reservations

      }));



      this.sessionDetails = new Map(parsedSessions.map(s => [s.id, s]));

      this.allSessions = parsedSessions;

      this.generateCalendar();

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

    return this.allSessions.filter((session:any) => {

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



toggleSession(session: any) {
  if (this.selectedSessions.has(session.id)) {
    this.selectedSessions.delete(session.id);
  } else {
    this.selectedSessions.add(session.id);
  }

  setTimeout(() => this.renderPayPalButton(), 0);
}

selectedDayDate?: Date; 

handleDayClick(day: CalendarDay): void {

  this.selectedDayDate = day.date;

  this.selectedDay = day; // Keep this if you're using it for sessions display

}



prevMonth(): void {

  this.currentMonth = new Date(

    this.currentMonth.getFullYear(),

    this.currentMonth.getMonth() - 1,

    1

  );

  this.generateCalendar();

  this.selectedDayDate = undefined;

  this.selectedDay = undefined;

}



nextMonth(): void {

  this.currentMonth = new Date(

    this.currentMonth.getFullYear(),

    this.currentMonth.getMonth() + 1,

    1

  );

  this.generateCalendar();

  this.selectedDayDate = undefined;

  this.selectedDay = undefined;

}

  isDayFullyBooked(day: CalendarDay): boolean {

    return day.sessions.length > 0 && 

           day.sessions.every(s => 

             !this.isSessionAvailable(s) || 

             s.isCanceled

           );

  }



  hasMixedAvailability(day: CalendarDay): boolean {

    return day.sessions.some(s => this.isSessionAvailable(s)) &&

           day.sessions.some(s => !this.isSessionAvailable(s));

  }

  enroll(): void {

    console.log(Array.from(this.selectedSessions),'this.selectedSessions');

    if (this.selectedSessions.size == 0) return;


    this.isEnrollmentLoading = true;

    this.coursesService.enrollInCourse(

      this.course.id,

      Array.from(this.selectedSessions) // ✅ Sends the array directly



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

    // Consider session unavailable if there are ANY reservations

    return session.reservations.length === 0 && !session.isCanceled;

  }

  isDaySelected(day: CalendarDay): boolean {

    return day.sessions.some(s => this.selectedSessions.has(s.id));

  }



  calculateTotalHours(): number {

    return this.allSessions.reduce((total:any, session:any) => {

      const start = new Date(session.start).getTime();

      const end = new Date(session.finish).getTime();

      return total + Math.round((end - start) / (1000 * 60 * 60));

    }, 0);

  }

  isDayFullyReserved(day: CalendarDay): boolean {

    return day.sessions.length > 0 && 

           day.sessions.every(session => !this.isSessionAvailable(session));

  }

  canEnroll(): boolean {

    return this.selectedSessions.size === this.REQUIRED_SESSIONS;

  }

hasUserReservation(session: any): boolean {

  if (!this.userId || !session.reservations) return false;

  return session.reservations.some((reservation: any) => 

    reservation && reservation.studentId === this.userId

  );

}

hasAnyReservations(): boolean {

  return this.allSessions.some((session:any) => this.hasUserReservation(session));

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

  renderPayPalButton() {
  const totalAmount = this.selectedSessions.size * 10;

  // Optional: remove previous button to avoid duplicates
  const container = document.getElementById('paypal-button-container');
  if (container) container.innerHTML = '';

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'pill',
      label: 'paypal'
    },

    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: totalAmount.toFixed(2)
          }
        }]
      });
    },

    onApprove: (data: any, actions: any) => {
      this.isPaymentLoading = true;
      return actions.order.capture().then((details: any) => {
        console.log('Payment approved by: ' + details.payer.name.given_name);
        this.localEnrollAfterPayment(); // Do local enroll
        this.isPaymentLoading = false;
      });
    },

    onError: (err: any) => {
      console.error('PayPal error:', err);
      this.isPaymentLoading = false;
    }
  }).render('#paypal-button-container');
}
localEnrollAfterPayment() {
  // You still keep your selectedSessions (IDs)
  // Call your existing enroll() to do frontend enrollment
  this.enroll();
  alert('Payment complete! You are now enrolled.');
}
}