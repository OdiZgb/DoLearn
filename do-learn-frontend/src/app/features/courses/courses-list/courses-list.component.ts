import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../services/courses.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Course } from '../../../models/Course';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    MatSnackBarModule, // Changed to module
    MatProgressSpinnerModule,
    RouterModule
  ]
  
})


export class CoursesListComponent implements OnInit {
  private apiUrl = 'http://localhost:5055/api/'; // Hell yeah we remember
  courses: CourseWithStatus[] = [];
  currentUserId?: number;
  userRole?: string;
 
  constructor(private coursesService: CoursesService,private route: ActivatedRoute, 
    private authService: AuthService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id;
      this.userRole = user?.role;
    });

    this.loadCourses();}
  private loadCourses() {
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses.map((c:any) => ({
          ...c,
          enrollmentStatus: 'not-enrolled',
          isEnrollmentLoading: false
        }));
        this.checkEnrollments();
      },
      error: (err) => console.error('Error fetching courses', err)
    });
  }

  private checkEnrollments() {
    if (!this.currentUserId) return;

    this.courses.forEach(course => {
      this.coursesService.getEnrollmentStatus(course.id).subscribe({
        next: (status) => {
          course.enrollmentStatus = status;
        }
      });
    });
  }

  onEnroll(course: CourseWithStatus) {
    if (!this.currentUserId) return;
  
    course.isEnrollmentLoading = true;
  
    this.coursesService.enrollInCourse(course.id).pipe(
      finalize(() => course.isEnrollmentLoading = false)
    ).subscribe({
      next: () => {
        course.enrollmentStatus = 'pending';
        this.snackBar.open('Enrollment request sent for approval', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error || 'Enrollment failed', 'Dismiss');
      }
    });
  }
  canEnroll(): boolean {
    return this.userRole === 'Student';
  }
}
export interface CourseWithStatus extends Course {
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled';
  isEnrollmentLoading: boolean;
}
