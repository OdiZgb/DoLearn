import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from "./auth/auth.service";
import { MatMenuModule } from '@angular/material/menu';
import { CategoryMenuItemComponent } from "./features/categories/category-menu-item/category-menu-item.component";
import { Category, CategoryService } from "./services/category.service";
import { Course } from "./models/Course";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { CoursesService } from "./services/courses.service";
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    CategoryMenuItemComponent,
        CommonModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    CategoryMenuItemComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatPaginatorModule
    
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'DoLearn';
  isSideNavOpen = true;
  isLoggedIn = false;
  currentRoute: string = '';
  private authSubscription: Subscription;
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  selectedCategoryName?: string;
  currentPage = 1;
  filteredCourses: CourseWithStatus[] = [];
  allCourses: CourseWithStatus[] = [];
   paginatedCourses: CourseWithStatus[] = [];
   currentUserId?: number;
  userRole?: string;
   isLoading = true;
   pageSize = 5;

  constructor(
    private authService: AuthService,
     public router: Router,
    private categoryService: CategoryService,
    private coursesService: CoursesService,
    private cdr: ChangeDetectorRef
  ) {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.checkLoginRedirect();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects.split('?')[0]; // Ignore query params
        this.checkLoginRedirect();
      }
    });
        this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Error loading categories', err)
    });
        this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || '';
    });
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  private checkLoginRedirect(): void {
    const protectedRoutes = ['/login', '/register'];

  }
  isHomeRoute(): boolean {
    return this.router.url === '/';
  }
  get showLayout(): boolean {
    const authPages = ['/login', '/register'];
    return !(authPages.includes(this.currentRoute) && !this.isLoggedIn);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
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


export interface CourseWithStatus extends Course {
  enrollmentStatus: 'enrolled' | 'pending' | 'not-enrolled';
  isEnrollmentLoading: boolean;
}
