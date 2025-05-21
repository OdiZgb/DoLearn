import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CoursesListComponent } from './features/courses/courses-list/courses-list.component';
import { CreateCourseComponent } from './features/courses/create-course/create-course.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CourseDetailsComponent } from './features/courses/course-details.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { CategoryFormComponent } from './features/categories/category-form/category-form.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent},
  { path: 'home', redirectTo: '/', },    
  { path: 'courses', component: CoursesListComponent },
  { path: 'courses/create', component: CreateCourseComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'categories',
    component: CategoriesComponent,
    children: [
      { path: 'new', component: CategoryFormComponent }, // /categories/new
      { path: 'edit/:id', component: CategoryFormComponent } // /categories/edit/1
    ]
  },

];
