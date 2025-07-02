import { ChangeDetectorRef, Component, HostListener, OnDestroy } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
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
import { DomSanitizer } from "@angular/platform-browser";

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
 username?: string;
 currentYear = new Date().getFullYear();
   featuredCourses: CourseWithStatus[] = [];
  newCourses: CourseWithStatus[] = [];
  popularCategories: Category[] = [];
    isMobile = false;
  constructor(
    private authService: AuthService,
     public router: Router,
    private categoryService: CategoryService,
    private coursesService: CoursesService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
      this.registerSocialIcons();
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
    @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
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
        this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // Adjust breakpoint as needed
  }
  private loadInitialData(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.popularCategories = this.getPopularCategories(categories);
        this.loadAllCourses();
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }
    private getPopularCategories(categories: Category[]): Category[] {
    // Sort by number of children or some other metric
    return [...categories]
      .sort((a, b) => b.children.length - a.children.length)
      .slice(0, 4);
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
        
        // Get featured (most recent) courses
        this.featuredCourses = [...this.allCourses]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
          
        // Get new courses (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        this.newCourses = this.allCourses.filter(course => 
          new Date(course.createdAt) > thirtyDaysAgo
        ).slice(0, 4);
        
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
      this.username = user?.username; 
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
private registerSocialIcons() {
  // Twitter (official bird logo)
  this.matIconRegistry.addSvgIcon(
    'twitter',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter-brand.svg')
  );
  
  // Facebook (official "f" logo)
  this.matIconRegistry.addSvgIcon(
    'facebook',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook-brand.svg')
  );
  
  // Instagram (official camera logo)
  this.matIconRegistry.addSvgIcon(
    'instagram',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/instagram-brand.svg')
  );
  
  // YouTube (official play button logo)
  this.matIconRegistry.addSvgIcon(
    'youtube',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/youtube-brand.svg')
  );
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
