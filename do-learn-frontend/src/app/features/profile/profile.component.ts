// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>{{user?.username}}'s Profile</mat-card-title>
          <mat-card-subtitle>{{user?.role}}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>email</mat-icon>
              <span matListItemTitle>Email</span>
              <span matListItemLine>{{user?.email}}</span>
            </mat-list-item>
            
            <mat-list-item>
              <mat-icon matListItemIcon>cake</mat-icon>
              <span matListItemTitle>Birthdate</span>
              <span matListItemLine>{{user?.birthdate | date}}</span>
            </mat-list-item>

            <mat-list-item>
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Member Since</span>
              <span matListItemLine>{{user?.registered | date}}</span>
            </mat-list-item>

            <mat-list-item *ngIf="user?.role === 'Teacher'">
              <mat-icon matListItemIcon>class</mat-icon>
              <span matListItemTitle>Courses Created</span>
              <span matListItemLine>{{user?.createdCoursesCount}}</span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .profile-card {
      padding: 20px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    
    if (this.authService.isAuthenticated()) {
      this.authService.fetchUserProfile().subscribe();
    }
  }
}