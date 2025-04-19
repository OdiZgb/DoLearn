// dashboard.component.ts
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../../services/courses.service';
import { AuthService } from '../../../auth/auth.service';

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
    RouterModule
  ]
})
export class DashboardComponent {
  enrolledCourses: any[] = [];
  createdCourses: any[] = [];
  userRole: string = '';

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || '';
      this.loadCourses();
    });
  }

  private loadCourses() {
    // Load enrolled courses
    this.coursesService.getEnrolledCourses().subscribe(courses => {
      this.enrolledCourses = courses;
    });

    // Load created courses if teacher/admin
    if (this.userRole === 'Teacher' || this.userRole === 'Admin') {
      this.coursesService.getCreatedCourses().subscribe(courses => {
        this.createdCourses = courses;
      });
    }
  }
}