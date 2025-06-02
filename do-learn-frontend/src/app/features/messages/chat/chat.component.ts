import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
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
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  recipientId: number | null = null;
  messageText: string = '';
  messages: Message[] = [];
  currentUserId: number | null = null;
  isConnected: boolean = false;
public readonly HubConnectionState = signalR.HubConnectionState;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public signalrService: SignalRService,
    private messagesService: MessagesService,
    private authService: AuthService,
  ) {}

  get hubConnection() {
    return this.signalrService.hubConnection;
  }

  ngOnInit(): void {
    this.authService.fetchUserProfile().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (!id) {
            this.router.navigate(['/']);
            return;
          }
          this.recipientId = +id;
          this.loadConversation();
          this.setupSignalRListeners();
        });
      },
      error: (err) => console.error('Failed to fetch user profile:', err)
    });

    this.signalrService.startConnection().then(() => {
      this.subscriptions.add(
        this.signalrService.connectionState$.subscribe(state => {
          this.isConnected = state === signalR.HubConnectionState.Connected;
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.signalrService.stopConnection();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private loadConversation(): void {
    if (!this.recipientId || !this.currentUserId) return;

    this.messagesService.getConversation(this.recipientId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.markMessagesAsRead();
      },
      error: (err) => console.error('Error loading conversation:', err)
    });
  }

  private setupSignalRListeners(): void {
    this.subscriptions.add(
      this.signalrService.messages$.subscribe(message => {
        if (!this.recipientId || !this.currentUserId) return;

        const isRelevant =
          (message.senderId === this.recipientId && message.receiverId === this.currentUserId) ||
          (message.senderId === this.currentUserId && message.receiverId === this.recipientId);

        if (!isRelevant) return;

        // Match by content + receiver to avoid duplicates
        const index = this.messages.findIndex(
          (m: any) => (m as any).tempId && m.content === message.content && m.receiverId === message.receiverId
        );

        if (index >= 0) {
          this.messages[index] = message;
        } else {
          this.messages.push(message);
        }
      })
    );

    this.subscriptions.add(
      this.signalrService.messageRead$.subscribe(messageId => {
        const msg = this.messages.find(m => m.id === messageId);
        if (msg) msg.isRead = true;
      })
    );
  }

sendMessage(): void {
  const content = this.messageText.trim();
  if (!content || !this.recipientId || !this.currentUserId) return;

  const tempId = Date.now();
  this.messageText = '';

  const tempMessage: Message = {
    id: -1,
    senderId: this.currentUserId,
    receiverId: this.recipientId,
    content,
    createdDate: new Date(),
    isRead: false,
    senderName: 'You',
    ...( { tempId } as any )
  };

  this.messages.push(tempMessage);

  if (this.signalrService.hubConnection?.state !== signalR.HubConnectionState.Connected) {
    console.warn('SignalR not connected, retry logic could go here.');
    return;
  }

  this.signalrService.sendMessage(this.recipientId, content)
    .catch(err => {
      console.error('Error sending message:', err);
      // Optionally retry or notify user
      this.messages = this.messages.filter(m => (m as any).tempId !== tempId);
    });
}
  markMessagesAsRead(): void {
    if (!this.currentUserId) return;

    const unreadMessages = this.messages.filter(
      m => m.receiverId === this.currentUserId && !m.isRead && m.id > 0
    );

    unreadMessages.forEach(msg => {
      this.signalrService.markAsRead(msg.id).catch(err => {
        console.error('Error marking message as read:', err);
      });
    });
  }
}
