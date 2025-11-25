import React, { useRef } from 'react';
import { Message, MessageStatus } from '../types';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  onContextMenu: (e: React.MouseEvent, message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isFirstInGroup, onContextMenu }) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimer.current = setTimeout(() => {
      // Create a synthetic event object compatible with React.MouseEvent
      const syntheticEvent = {
        preventDefault: () => {},
        clientX,
        clientY,
      } as unknown as React.MouseEvent;

      onContextMenu(syntheticEvent, message);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    // If user scrolls, cancel long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  
  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(ts));
  };

  const renderStatus = () => {
    if (message.isOutgoing) {
      if (message.status === MessageStatus.QUEUED) return <Clock size={12} className="text-gray-400" />;
      if (message.status === MessageStatus.SENT) return <Check size={12} className="text-gray-400" />;
      if (message.status === MessageStatus.DELIVERED) return <CheckCheck size={12} className="text-gray-400" />;
      if (message.status === MessageStatus.READ) return <CheckCheck size={12} className="text-blue-400" />;
    }
    return null;
  };

  return (
    <div 
      className={`flex flex-col w-full ${message.isOutgoing ? 'items-end' : 'items-start'} ${isFirstInGroup ? 'mt-2' : 'mt-1'}`}
      onContextMenu={(e) => onContextMenu(e, message)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div 
        className={`
          max-w-[85%] sm:max-w-[75%] px-3 py-1.5 rounded-lg text-[15px] leading-snug shadow-sm relative group select-none active:brightness-90 transition-filter
          ${message.isOutgoing 
            ? 'bg-emerald-700 text-white rounded-tr-none' 
            : 'bg-slate-700 text-slate-100 rounded-tl-none'}
        `}
      >
        {/* Reply Context Stub */}
        {message.replyToId && (
          <div className="border-l-2 border-white/30 pl-2 mb-1 text-xs text-white/70 italic">
            Replying to message...
          </div>
        )}

        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        
        <div className="flex justify-end items-center space-x-1 mt-1 opacity-70">
          <span className="text-[10px]">{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;