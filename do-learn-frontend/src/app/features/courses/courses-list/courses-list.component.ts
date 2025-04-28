// courses-list.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../services/courses.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course } from '../../../models/Course';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../auth/auth.service';
import { Category, CategoryService } from '../../../services/category.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  imports: [ 
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    MatProgressSpinnerModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatSelectModule
  ]
})
export class CoursesListComponent implements OnInit {
  courses: CourseWithStatus[] = [];
  currentUserId?: number;
  userRole?: string;
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  isLoading = true;

  constructor(
    private coursesService: CoursesService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllCourses();

    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id;
      this.userRole = user?.role;
    });
  }

  private loadAllCourses() {
    this.isLoading = true;
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses.map((c:any) => ({
          ...c,
          enrollmentStatus: 'not-enrolled',
          isEnrollmentLoading: false
        }));
        this.checkEnrollments();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.isLoading = false;
      }
    });
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories', err)
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
  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }
  canEnroll(): boolean {
    return this.userRole === 'Student';
  }
  onCategoryChange(selectedId: number | null) {
    this.isLoading = true;
    this.courses = [];
  
    if (selectedId === null) {
      this.loadAllCourses();
      return;
    }
    console.log('Making API call for category:', selectedId); // Add this

    // 3. Use correct service (coursesService instead of categoryService)
    this.coursesService.getCoursesByCategoryId(selectedId).subscribe({
      next: (courses) => {
        
        this.courses = courses.map((c: any) => ({
          ...c,
          enrollmentStatus: 'not-enrolled',
          isEnrollmentLoading: false
        }));
        this.checkEnrollments();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.isLoading = false;
      }
    });
  }

}

export interface CourseWithStatus extends Course {
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled';
  isEnrollmentLoading: boolean;
}