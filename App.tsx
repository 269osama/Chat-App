import React, { useState, useEffect, useRef } from 'react';
import ChatList from './components/ChatList';
import MessageBubble from './components/MessageBubble';
import { ChatSession, Message, MessageStatus, User } from './types';
import { MOCK_USERS, INITIAL_CHATS, CURRENT_USER_ID } from './constants';
import { generateSmartReplies, rewriteMessage, chatWithGemini } from './services/geminiService';
import { Send, Paperclip, MoreVertical, Sparkles, Smile, ArrowLeft, Mic } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Simple Context Menu Component
const ContextMenu = ({ x, y, onClose, actions }: { x: number, y: number, onClose: () => void, actions: any[] }) => {
  // Adjust position to prevent overflow on mobile screens
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      let newLeft = x;
      let newTop = y;

      if (x + rect.width > screenWidth) {
        newLeft = screenWidth - rect.width - 10;
      }
      if (y + rect.height > screenHeight) {
        newTop = y - rect.height;
      }
      setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y]);

  return (
    <div 
      ref={menuRef}
      className="fixed bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1 min-w-[160px]"
      style={{ top: position.top, left: position.left }}
    >
      {actions.map((action, i) => (
        <button 
          key={i}
          className="w-full text-left px-4 py-3 md:py-2 hover:bg-slate-700 text-sm text-slate-200 flex items-center gap-3 active:bg-slate-600 transition-colors"
          onClick={() => { action.onClick(); onClose(); }}
        >
          {action.icon && <action.icon size={16} className="text-emerald-400" />}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Smart features state
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: Message } | null>(null);

  const activeChat = chats.find(c => c.userId === activeChatId);
  const activeUser = activeChatId ? MOCK_USERS[activeChatId] : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Handle incoming messages simulation
  useEffect(() => {
    if (!activeChat) return;

    // Simulate smart replies generation when last message is from other
    const lastMsg = activeChat.messages[activeChat.messages.length - 1];
    if (lastMsg && !lastMsg.isOutgoing) {
      setIsAiThinking(true);
      generateSmartReplies(lastMsg.text).then(replies => {
        setSmartReplies(replies);
        setIsAiThinking(false);
      });
    } else {
      setSmartReplies([]);
    }
  }, [activeChat?.messages]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: CURRENT_USER_ID,
      text: text,
      timestamp: Date.now(),
      status: MessageStatus.SENT, // Ideally QUEUED if offline, but MVP assumes online
      isOutgoing: true
    };

    updateChatMessages(activeChatId, newMessage);
    setInputText('');
    setSmartReplies([]);

    // Gemini Bot Response Logic
    if (activeChatId === 'gemini') {
      setIsTyping(true);
      const history = activeChat!.messages.map(m => ({
        role: m.senderId === 'gemini' ? 'model' as const : 'user' as const,
        text: m.text
      }));
      
      const responseText = await chatWithGemini(history, text);
      
      const geminiMsg: Message = {
        id: crypto.randomUUID(),
        senderId: 'gemini',
        text: responseText,
        timestamp: Date.now(),
        status: MessageStatus.READ,
        isOutgoing: false
      };
      
      setIsTyping(false);
      updateChatMessages('gemini', geminiMsg);
    }
  };

  const updateChatMessages = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => {
      if (chat.userId === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessagePreview: message.text,
          lastMessageTime: message.timestamp,
          unreadCount: 0
        };
      }
      return chat;
    }));
  };

  const handleRewrite = async (tone: 'professional' | 'friendly' | 'concise') => {
    if (!inputText) return;
    setIsAiThinking(true);
    const rewritten = await rewriteMessage(inputText, tone);
    setInputText(rewritten);
    setIsAiThinking(false);
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="flex h-[100dvh] bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Hidden on mobile if chat is active */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
        <ChatList 
          chats={chats} 
          activeUserId={activeChatId} 
          onSelectChat={setActiveChatId} 
        />
      </div>

      {/* Main Chat Area */}
      {activeChat && activeUser ? (
        <div className={`flex-1 flex flex-col h-full bg-[#0b1014] relative transition-all duration-300 w-full`}>
          
          {/* Top Bar */}
          <div className="h-16 bg-slate-800 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveChatId(null)} 
                className="md:hidden text-slate-300 p-2 -ml-2 hover:bg-slate-700 rounded-full"
              >
                <ArrowLeft />
              </button>
              <img src={activeUser.avatarUrl} className="w-10 h-10 rounded-full" alt="avatar" />
              <div>
                <h2 className="font-semibold text-slate-100">{activeUser.name}</h2>
                <div className="text-xs text-slate-400">
                   {isTyping ? <span className="text-emerald-400">typing...</span> : (activeUser.isOnline ? 'online' : 'last seen recently')}
                   <span className="ml-2 opacity-50 font-mono text-[10px] uppercase border border-slate-600 px-1 rounded hidden sm:inline-block">
                     {activeUser.fingerprint}
                   </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-slate-400">
              <MoreVertical className="cursor-pointer hover:text-white p-1" />
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-2 bg-[url('https://repo.sourcelink.com/patterns/subtle-dark-vertical.png')] bg-repeat"
          >
             {/* Security Note */}
            <div className="flex justify-center my-4">
              <span className="bg-slate-800/80 text-amber-400 text-[10px] sm:text-xs px-3 py-1 rounded-full border border-amber-400/20 text-center max-w-[85%]">
                🔒 Encrypted. Verify safety number in person.
              </span>
            </div>

            {activeChat.messages.map((msg, idx) => {
              const prevMsg = activeChat.messages[idx - 1];
              const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
              return (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isFirstInGroup={isFirst}
                  onContextMenu={handleContextMenu}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Reply Chips */}
          {smartReplies.length > 0 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar bg-[#0b1014] w-full">
               <div className="flex items-center text-xs text-emerald-400 font-bold mr-2 shrink-0">
                 <Sparkles size={14} className="mr-1" /> AI Suggests:
               </div>
               {smartReplies.map((reply, i) => (
                 <button 
                  key={i}
                  onClick={() => handleSendMessage(reply)}
                  className="whitespace-nowrap bg-slate-800 border border-emerald-900/50 hover:bg-slate-700 text-slate-200 text-sm px-4 py-1.5 rounded-full transition-colors shrink-0"
                 >
                   {reply}
                 </button>
               ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-2 sm:p-3 bg-slate-800 flex items-end gap-2 shrink-0 pb-safe-area">
             <div className="hidden sm:flex gap-3 pb-3 text-slate-400">
                <Smile className="hover:text-slate-200 cursor-pointer" />
                <Paperclip className="hover:text-slate-200 cursor-pointer" />
             </div>
             <div className="sm:hidden flex pb-3 text-slate-400">
                <Smile className="hover:text-slate-200 cursor-pointer" />
             </div>
             
             <div className="flex-1 bg-slate-900 rounded-2xl flex flex-col border border-slate-700 focus-within:border-emerald-500 transition-colors">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message"
                  className="bg-transparent text-slate-100 p-3 max-h-32 min-h-[44px] resize-none outline-none w-full text-base"
                  rows={1}
                />
                {/* AI Tools Bar inside input */}
                {inputText.length > 3 && (
                  <div className="px-2 pb-1 flex justify-end gap-2">
                     <button onClick={() => handleRewrite('professional')} className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-900/30 px-2 py-1 rounded touch-manipulation">
                       <Sparkles size={10} /> Formal
                     </button>
                     <button onClick={() => handleRewrite('friendly')} className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-900/30 px-2 py-1 rounded touch-manipulation">
                       <Sparkles size={10} /> Friendly
                     </button>
                  </div>
                )}
             </div>

             <button 
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:bg-slate-700 mb-0.5 active:scale-95 transition-transform"
             >
               {inputText.trim() ? <Send size={20} className="ml-1" /> : <Mic size={22} />}
             </button>
          </div>

          {/* Context Menu Overlay */}
          {contextMenu && (
             <ContextMenu 
               x={contextMenu.x} 
               y={contextMenu.y} 
               onClose={() => setContextMenu(null)}
               actions={[
                 { label: 'Reply', onClick: () => console.log('Reply to', contextMenu.message.id) },
                 { label: 'Copy', onClick: () => navigator.clipboard.writeText(contextMenu.message.text) },
                 { label: 'Explain with AI', icon: Sparkles, onClick: async () => {
                   // Simulate explanation
                   const explanation = `Analyzing: "${contextMenu.message.text}"...`;
                   alert(explanation); // In real app, open a modal or AI chat
                 }},
                 { label: 'Delete', onClick: () => console.log('Delete') }
               ]}
             />
          )}

        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#0b1014] text-slate-400 border-l border-slate-700">
           <div className="bg-slate-800 p-6 rounded-full mb-4">
             <span className="text-4xl">📡</span>
           </div>
           <h3 className="text-lg font-medium text-slate-200">OffNetWalkie Web</h3>
           <p className="max-w-xs text-center mt-2 text-sm">
             Send and receive messages without keeping your phone online. 
             Use OffNetWalkie on up to 4 linked devices and 1 phone.
           </p>
           <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Encryption Active
           </div>
        </div>
      )}
    </div>
  );
}