import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;

  startConnection(userId: string, token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://your-api-url/chatHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection established.');
      })
      .catch(err => console.log('Error establishing SignalR connection: ', err));

    this.hubConnection.on('ReceiveMessage', (fromUserId: string, message: string) => {
      console.log(`Message from ${fromUserId}: ${message}`);
      // You can use a Subject here to push this into a component or store
    });
  }

  sendMessage(toUserId: string, message: string, fromUserId: string) {
    this.hubConnection.invoke('SendPrivateMessage', toUserId, message, fromUserId)
      .catch(err => console.error('Error sending message: ', err));
  }

  stopConnection() {
    this.hubConnection.stop();
  }
}
