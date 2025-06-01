import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Message } from '../../../models/message';
import { SignalRService } from '../../../services/signalr.service';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../auth/auth.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    
    
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  recipientId: number | null = null;
  messageText: string = '';
  messages: Message[] = [];
  public subscriptions = new Subscription();
  currentUserId: number | null = null;
  public signalRHubConnectionState = signalR.HubConnectionState;
public isConnected: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public signalrService: SignalRService, 
    private messagesService: MessagesService,
    private authService: AuthService,
  ) {}
 public get hubConnection() {
    return this.signalrService.hubConnection;
  }
  
  public get connectionState() {
    return signalR.HubConnectionState;
  }
 
ngOnInit(): void {
  this.authService.fetchUserProfile().subscribe({
  next: (user) => {
    console.log('Fetched user profile:', user);
  },
  error: (err) => {
    console.error('Failed to fetch user profile:', err);
  }
});
  this.subscriptions.add(
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
          if (this.currentUserId && this.recipientId) {
      this.loadConversation(); // Load after user ID is known
    }
    })
  );

  this.signalrService.startConnection().then(() => {
    this.subscriptions.add(
      this.signalrService.connectionState$.subscribe(state => {
        this.isConnected = state === signalR.HubConnectionState.Connected;
            console.log('isConnected:', this.isConnected);
      })
    );
  });

this.route.paramMap.subscribe(params => {
  const id = params.get('id');
  if (!id) {
    this.router.navigate(['/']);
    return;
  }
  this.recipientId = +id;
  if (this.currentUserId && this.recipientId) {
    this.loadConversation(); // Load if user ID already ready
  }
  this.setupSignalRListeners();
});}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.signalrService.stopConnection();
  }

  private loadConversation(): void {
    if (!this.recipientId || !this.currentUserId) return;

    this.messagesService.getConversation(this.recipientId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.markMessagesAsRead(); // Mark messages as read when loading conversation
      },
      error: (err) => console.error('Error loading conversation:', err)
    });
  }

  private setupSignalRListeners(): void {
    // Listen for new messages
    this.subscriptions.add(
      this.signalrService.messages$.subscribe(message => {
        if (!this.recipientId || !this.currentUserId) return;

        if ((message.senderId === this.recipientId && message.receiverId === this.currentUserId) ||
            (message.senderId === this.currentUserId && message.receiverId === this.recipientId)) {
          // Replace temporary message if exists
          const existingIndex = this.messages.findIndex(m => 
            (m as any).tempId && message.content === m.content);
          if (existingIndex >= 0) {
            this.messages[existingIndex] = message;
          } else {
            this.messages.push(message);
          }
        }
      })
    );

    // Listen for read receipts
    this.subscriptions.add(
      this.signalrService.messageRead$.subscribe(messageId => {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
          message.isRead = true;
        }
      })
    );
  }

sendMessage(): void {
  console.log('DEBUG: messageText =', this.messageText);
  console.log('DEBUG: recipientId =', this.recipientId);
  console.log('DEBUG: currentUserId =', this.currentUserId);

  if (!this.messageText.trim() || !this.recipientId || !this.currentUserId) {
    console.log('Validation failed - not sending');
    return;
  }
  const tempId = Date.now(); // Temporary ID for optimistic UI update
  const contentToSend = this.messageText; // Capture message before clearing

  const tempMessage: Message = {
    id: -1,
    senderId: this.currentUserId,
    receiverId: this.recipientId,
    content: contentToSend,
    createdDate: new Date(),
    isRead: false,
    senderName: 'You',
    ...({ tempId } as any)
  };

  this.messages.push(tempMessage);
  this.messageText = ''; // Clear AFTER capturing

  this.signalrService.sendMessage(this.recipientId, contentToSend)
    .catch(err => {
      console.error('Error sending message:', err);
      this.messages = this.messages.filter(m => (m as any).tempId !== tempId);
    });

  console.log('✅ Message sent attempt:', contentToSend);
}


  markMessagesAsRead(): void {
    if (!this.currentUserId) return;

    const unreadMessages = this.messages.filter(
      m => m.receiverId === this.currentUserId && !m.isRead && m.id > 0 // Only mark real messages as read
    );

    unreadMessages.forEach(message => {
      this.signalrService.markAsRead(message.id).catch(err => {
        console.error('Error marking message as read:', err);
      });
    });
  }
}