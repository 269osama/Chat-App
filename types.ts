export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  fingerprint: string; // The crypto fingerprint mentioned in requirements
  isOnline: boolean;
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  QUEUED = 'QUEUED' // Simulating offline queue
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  isOutgoing: boolean;
  replyToId?: string;
}

export interface ChatSession {
  userId: string; // The other person
  messages: Message[];
  lastMessagePreview: string;
  lastMessageTime: number;
  unreadCount: number;
  draft?: string;
}

export enum GeminiActionType {
  SMART_REPLY = 'SMART_REPLY',
  REWRITE = 'REWRITE',
  TRANSLATE = 'TRANSLATE',
  SUMMARIZE = 'SUMMARIZE'
}
