// services/messages.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
private apiUrl = 'http://localhost:5055/api/Messages';  

  constructor(private http: HttpClient) {}

  getConversation(otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${otherUserId}`);
  }

  markAsRead(messageId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read/${messageId}`, {});
  }

  getChatContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contacts`);
  }
}