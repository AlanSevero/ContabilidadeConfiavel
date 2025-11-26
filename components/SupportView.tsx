import React, { useState, useEffect, useRef } from 'react';
import { Accountant, ChatMessage } from '../types';
import { Button } from './Button';
import { Send, Phone, Paperclip, CheckCheck } from 'lucide-react';
import { getAssignedAccountant, getSupportMessages } from '../services/storageService';

export const SupportView: React.FC = () => {
  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountant(getAssignedAccountant());
    setMessages(getSupportMessages());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: 'user',
      text: inputText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate accountant reply
    setTimeout(() => {
        const reply: ChatMessage = {
            id: crypto.randomUUID(),
            senderId: 'accountant',
            text: 'Recebi sua mensagem! Vou analisar e te respondo em instantes.',
            timestamp: new Date().toISOString(),
            isRead: false
        };
        setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  if (!accountant) return <div>Carregando...</div>;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                {accountant.photoUrl ? (
                   <img src={accountant.photoUrl} alt={accountant.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                        {accountant.name.charAt(0)}
                    </div>
                )}
             </div>
             <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${accountant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{accountant.name}</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
               {accountant.role} • <span className="text-green-600 font-medium">Online Agora</span>
            </p>
          </div>
        </div>
        <Button 
            variant="secondary" 
            size="sm" 
            className="hidden sm:flex border-green-200 text-green-700 hover:bg-green-50"
            icon={<Phone className="w-4 h-4" />}
            onClick={() => window.open(`https://wa.me/${accountant.whatsapp}`, '_blank')}
        >
            WhatsApp
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        <div className="text-center text-xs text-gray-400 my-4">
           <span>Atendimento iniciado em {new Date().toLocaleDateString()}</span>
        </div>
        
        {messages.map(msg => {
            const isMe = msg.senderId === 'user';
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] sm:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm ${
                       isMe 
                         ? 'bg-primary-600 text-white rounded-br-none' 
                         : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                   }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                   </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex items-center gap-3">
            <button type="button" className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                <Paperclip className="w-5 h-5" />
            </button>
            <input 
                type="text" 
                className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Digite sua mensagem..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
            />
            <button 
                type="submit" 
                className={`p-3 rounded-full transition-all ${
                    inputText.trim() 
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md transform hover:scale-105' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!inputText.trim()}
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>
    </div>
  );
};