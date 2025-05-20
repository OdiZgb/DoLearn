import { Component, OnDestroy } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from "./auth/auth.service";

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
    MatButtonModule
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

  constructor(
    private authService: AuthService,
    private router: Router
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
  }

 

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  private checkLoginRedirect(): void {
    const protectedRoutes = ['/login', '/register'];
    if (this.isLoggedIn && protectedRoutes.includes(this.currentRoute)) {
      this.router.navigate(['/dashboard']);
    }
  }

  get showLayout(): boolean {
    const authPages = ['/login', '/register'];
    return !(authPages.includes(this.currentRoute) && !this.isLoggedIn);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}