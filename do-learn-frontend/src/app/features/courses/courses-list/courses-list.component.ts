// courses-list.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../services/courses.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Course } from '../../../models/Course';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../auth/auth.service';
import { Category, CategoryService } from '../../../services/category.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { CategoryMenuItemComponent } from '../../categories/category-menu-item/category-menu-item.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  imports: [ 
    CommonModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ]
})
export class CoursesListComponent implements OnInit {
  allCourses: CourseWithStatus[] = [];
  filteredCourses: CourseWithStatus[] = [];
  paginatedCourses: CourseWithStatus[] = [];
  categories: Category[] = [];
  currentUserId?: number;
  userRole?: string;
  selectedCategoryId: number | null = null;
  selectedCategoryName?: string;
  isLoading = true;
  currentPage = 1;
  pageSize = 5;

  constructor(
    private coursesService: CoursesService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupUserSubscription();
  }

  private loadInitialData(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadAllCourses();
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  private loadAllCourses(): void {
    this.isLoading = true;
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.allCourses = courses.map((c:any) => ({
          ...c,
          enrollmentStatus: 'not-enrolled',
          isEnrollmentLoading: false
        }));
        this.applyFilters();
        this.checkEnrollments();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.isLoading = false;
      }
    });
  }

  private applyFilters(): void {
    // Filter courses by category
    this.filteredCourses = this.selectedCategoryId
      ? this.allCourses.filter(course => course.category?.id === this.selectedCategoryId)
      : this.allCourses;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCourses = this.filteredCourses.slice(startIndex, endIndex);
  }

  private checkEnrollments(): void {
    if (!this.currentUserId) return;

    this.allCourses.forEach(course => {
      this.coursesService.getEnrollmentStatus(course.id).subscribe({
        next: (status) => {
          course.enrollmentStatus = status;
          this.cdr.detectChanges();
        }
      });
    });
  }

  private setupUserSubscription(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id;
      this.userRole = user?.role;
      if (this.allCourses.length > 0) this.checkEnrollments();
    });
  }

  onCategorySelect(categoryId: number): void {
    const category = this.findCategory(this.categories, categoryId);
    this.selectedCategoryId = categoryId;
    this.selectedCategoryName = category?.name;
    this.currentPage = 1;
    this.applyFilters();
  }

  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  private findCategory(categories: Category[], id: number): Category | undefined {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = this.findCategory(cat.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }
}

export interface CourseWithStatus extends Course {
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled';
  isEnrollmentLoading: boolean;
}