// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import {MatIconModule} from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports:[MatIconModule,DatePipe,MatCardModule]
})
export class ProfileComponent implements OnInit {
  user: any;
  avatarGradient: string = '';
  userInitials: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.userInitials = this.getInitials(user.username);
        this.avatarGradient = this.generateGradient(user.id);
      }
    });
    
    if (this.authService.isAuthenticated()) {
      this.authService.fetchUserProfile().subscribe();
    }
  }

  private getInitials(username: string): string {
    return username.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private generateGradient(id: number): string {
    const hue = id % 360; // Generate hue based on user ID
    return `linear-gradient(135deg, 
      hsl(${hue}, 70%, 50%),
      hsl(${(hue + 30) % 360}, 70%, 50%))`;
  }
}