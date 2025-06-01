// models/message.model.ts
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdDate: Date;
  isRead: boolean;
  senderName?: string;
  receiverName?: string;
}