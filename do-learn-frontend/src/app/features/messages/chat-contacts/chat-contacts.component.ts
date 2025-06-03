import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessagesService } from '../../../services/messages.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TruncatePipe } from './(truncate.pipe';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrls: ['./chat-contacts.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TruncatePipe
  ]
})
export class ChatContactsComponent implements OnInit {
  contacts: any[] = [];
  loading = true;

  // Colors for avatar backgrounds
  avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  constructor(
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.messagesService.getChatContacts().subscribe({
      next: (data) => {
        this.contacts = data.map(contact => ({
          ...contact,
          unreadCount: Math.floor(Math.random() * 5) // Mock unread count - replace with real data
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load contacts', err);
        this.loading = false;
      }
    });
  }

  openChat(contactId: number): void {
    this.router.navigate(['/messages', contactId]);
  }

  getAvatarColor(username: string): string {
    const hash = username.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return this.avatarColors[hash % this.avatarColors.length];
  }
}