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
    MatProgressSpinnerModule
  ]
})
export class CourseDetailsComponent implements OnInit {
  course!: Course;
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled' = 'not-enrolled';
  isEnrollmentLoading = false;
  userRole?: string;
  userId?: number;

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
}
