import { User, ChatSession, MessageStatus } from './types';

export const CURRENT_USER_ID = 'me';

export const MOCK_USERS: Record<string, User> = {
  'alice': {
    id: 'alice',
    name: 'Alice Encryption',
    avatarUrl: 'https://picsum.photos/seed/alice/200/200',
    fingerprint: 'abcd1234',
    isOnline: true,
  },
  'bob': {
    id: 'bob',
    name: 'Bob Builder',
    avatarUrl: 'https://picsum.photos/seed/bob/200/200',
    fingerprint: 'efgh5678',
    isOnline: false,
  },
  'gemini': {
    id: 'gemini',
    name: 'Gemini Assistant',
    avatarUrl: 'https://picsum.photos/seed/gemini/200/200',
    fingerprint: 'AI-CORE-V2',
    isOnline: true,
  }
};

export const INITIAL_CHATS: ChatSession[] = [
  {
    userId: 'alice',
    messages: [
      {
        id: 'msg-1',
        senderId: 'alice',
        text: 'Hey! Did you get the encryption keys setup?',
        timestamp: Date.now() - 3600000,
        status: MessageStatus.READ,
        isOutgoing: false,
      },
      {
        id: 'msg-2',
        senderId: CURRENT_USER_ID,
        text: 'Yes, verifying the fingerprint now. abcd1234 right?',
        timestamp: Date.now() - 3500000,
        status: MessageStatus.READ,
        isOutgoing: true,
      }
    ],
    lastMessagePreview: 'Yes, verifying the fingerprint now...',
    lastMessageTime: Date.now() - 3500000,
    unreadCount: 0,
  },
  {
    userId: 'gemini',
    messages: [
      {
        id: 'msg-g1',
        senderId: 'gemini',
        text: 'Hello! I am your AI assistant integrated into OffNetWalkie. I can help you draft messages, translate texts, or summarize long conversations. Just ask!',
        timestamp: Date.now() - 86400000,
        status: MessageStatus.READ,
        isOutgoing: false,
      }
    ],
    lastMessagePreview: 'Just ask!',
    lastMessageTime: Date.now() - 86400000,
    unreadCount: 0,
  }
];
