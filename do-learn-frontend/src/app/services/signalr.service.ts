// services/signalr.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Message } from '../models/message';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public hubConnection: signalR.HubConnection | any;
  public messages$ = new Subject<Message>();
  public messageRead$ = new Subject<number>();
  public connectionState$ = new BehaviorSubject<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  // Directly use your API URL
  private apiUrl = `${environment.apiUrl}`;

  constructor(private authService: AuthService) {}

public startConnection(): Promise<void> {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${this.apiUrl}/messageHub`, {
      accessTokenFactory: () => {
        const token = this.authService.getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }
        return token;
      }
    })
    .withAutomaticReconnect()
    .build();

  this.registerListeners();

  // Monitor state changes
  this.hubConnection.onclose(() => this.connectionState$.next(signalR.HubConnectionState.Disconnected));
  this.hubConnection.onreconnected(() => this.connectionState$.next(signalR.HubConnectionState.Connected));
  this.hubConnection.onreconnecting(() => this.connectionState$.next(signalR.HubConnectionState.Reconnecting));

  return this.hubConnection.start()
    .then(() => {
      this.connectionState$.next(signalR.HubConnectionState.Connected);
      console.log('SignalR connection started');
    })
    .catch((err: any) => {
      this.connectionState$.next(signalR.HubConnectionState.Disconnected);
      console.error('Error starting SignalR connection:', err);
    });
}


  private registerListeners(): void {
    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.messages$.next(message);
    });

    this.hubConnection.on('MessageRead', (messageId: number) => {
      this.messageRead$.next(messageId);
    });
  }

sendMessage(receiverId: number, content: string): Promise<void> {
  return this.hubConnection.invoke('SendMessage', {
    receiverId: receiverId,
    content: content
  });
}

  public markAsRead(messageId: number): Promise<void> {
    return this.hubConnection.invoke('MarkAsRead', messageId);
  }

  public stopConnection(): void {
    this.hubConnection?.stop();
  }
}