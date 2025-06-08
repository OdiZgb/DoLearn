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
import { MatTreeModule } from '@angular/material/tree';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { TruncatePipe } from '../../messages/chat-contacts/(truncate.pipe';
import { TimeAgoPipe } from '../../../Shared/time-ago.pipe';

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
    MatPaginatorModule,
    MatTreeModule,
    MatListModule,
    MatExpansionModule,
    TruncatePipe,
    MatProgressSpinnerModule
  ]
})
export class CoursesListComponent implements OnInit {
  allCourses: CourseWithStatus[] = [];
  filteredCourses: CourseWithStatus[] = [];
  paginatedCourses: CourseWithStatus[] = [];
  categories: Category[] = [];
  parentCategories: Category[] = [];
  currentUserId?: number;
  userRole?: string;
  selectedCategoryId: number | null = null;
  selectedCategoryName?: string;
  selectedParentCategoryId: number | null = null;
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
        this.parentCategories = categories.filter(cat => cat.parentId === null);
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
  if (this.selectedCategoryId) {
    // Single category selected
    this.filteredCourses = this.allCourses.filter(course => course.category?.id === this.selectedCategoryId);
  } else if (this.selectedParentCategoryId) {
    // Parent category selected - get all courses from this category and its children
    const categoryIds = this.getAllCategoryIds(this.selectedParentCategoryId);
    this.filteredCourses = this.allCourses.filter(course => 
      course.category && categoryIds.includes(course.category.id)
    );
  } else {
    // No category selected - show all courses
    this.filteredCourses = this.allCourses;
  }

  // Apply pagination
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedCourses = this.filteredCourses.slice(startIndex, endIndex);
}

private getAllCategoryIds(parentId: number): number[] {
  const categoryIds: number[] = [parentId]; // Include the parent category itself
  
  const parentCategory = this.categories.find(cat => cat.id === parentId);
  if (!parentCategory) return categoryIds;

  // Recursively add all child category IDs
  const addChildIds = (category: Category) => {
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        categoryIds.push(child.id);
        addChildIds(child);
      });
    }
  };

  addChildIds(parentCategory);
  return categoryIds;
}

  private getChildCategoryIds(parentId: number): number[] {
    const parentCategory = this.categories.find(cat => cat.id === parentId);
    if (!parentCategory) return [];

    const childIds: number[] = [];
    
    const collectChildIds = (category: Category) => {
      if (category.children) {
        category.children.forEach(child => {
          childIds.push(child.id);
          collectChildIds(child);
        });
      }
    };

    collectChildIds(parentCategory);
    return childIds;
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
    this.selectedParentCategoryId = null;
    this.selectedCategoryName = category?.name;
    this.currentPage = 1;
    this.applyFilters();
  }

  onParentCategorySelect(parentId: number): void {
    const parentCategory = this.categories.find(cat => cat.id === parentId);
    this.selectedParentCategoryId = parentId;
    this.selectedCategoryId = null;
    this.selectedCategoryName = parentCategory?.name;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearCategoryFilters(): void {
    this.selectedCategoryId = null;
    this.selectedParentCategoryId = null;
    this.selectedCategoryName = undefined;
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

  hasSubcategories(category: Category): boolean {
    return category.children && category.children.length > 0;
  }
}

export interface CourseWithStatus extends Course {
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled';
  isEnrollmentLoading: boolean;
}