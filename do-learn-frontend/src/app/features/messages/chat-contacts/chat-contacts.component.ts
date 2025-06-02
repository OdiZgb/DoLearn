import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessagesService } from '../../../services/messages.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrls: ['./chat-contacts.component.scss'],
    standalone: true, // If you're using standalone components
  imports: [
    CommonModule,
    MatCardModule,
    DatePipe
  ]
})
export class ChatContactsComponent implements OnInit {
  contacts: any[] = [];
  loading = true;

  constructor(
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.messagesService.getChatContacts().subscribe({
      next: (data) => {
        this.contacts = data;
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
}
