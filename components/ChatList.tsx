import React from 'react';
import { ChatSession } from '../types';
import { MOCK_USERS } from '../constants';
import { Search, Plus, Menu } from 'lucide-react';

interface ChatListProps {
  chats: ChatSession[];
  activeUserId: string | null;
  onSelectChat: (userId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeUserId, onSelectChat }) => {
  return (
    <div className="w-full md:w-80 h-full border-r border-slate-700 flex flex-col bg-slate-900 relative">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-slate-800 shrink-0">
        <Menu className="text-slate-400 cursor-pointer hover:text-white" size={24} />
        <h1 className="font-bold text-lg tracking-wide">OffNetWalkie</h1>
        <Search className="text-slate-400 cursor-pointer hover:text-white" size={24} />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const user = MOCK_USERS[chat.userId];
          const isActive = activeUserId === chat.userId;
          
          return (
            <div
              key={chat.userId}
              onClick={() => onSelectChat(chat.userId)}
              className={`
                flex items-center px-4 py-3 cursor-pointer transition-colors active:bg-slate-800
                ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}
              `}
            >
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover bg-slate-600"
                />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                )}
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold truncate text-slate-100">{user.name}</h3>
                  <span className="text-xs text-slate-400">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-sm text-slate-400 truncate pr-2">
                    {chat.draft ? <span className="text-red-400">Draft: {chat.draft}</span> : chat.lastMessagePreview}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 h-5 rounded-full flex items-center justify-center min-w-[20px]">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Spacer for FAB */}
        <div className="h-20 md:hidden"></div>
      </div>

      {/* FAB (Floating Action Button) */}
      <div className="absolute bottom-6 right-6 z-10">
        <button className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 text-white">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatList;