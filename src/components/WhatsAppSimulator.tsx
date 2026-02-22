import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Smartphone, User, MoreVertical, Phone, Video, Paperclip, Smile, Mic, CheckCheck, FileText, Link as LinkIcon } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'bot';
  timestamp: string;
  isLink?: boolean;
}

interface WhatsAppSimulatorProps {
  onSendMessage: (text: string, url?: string) => Promise<void>;
}

export function WhatsAppSimulator({ onSendMessage }: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! I'm your Social Saver bot. Send me any link from Instagram, TikTok, or the web, and I'll analyze it for you!", sender: 'bot', timestamp: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [showLogInput, setShowLogInput] = useState(false);
  const [chatLog, setChatLog] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLink: text.includes('http')
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    // Extract URL if present
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : undefined;

    try {
      await onSendMessage(text, url);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: url ? "Got it! Analyzing that for your dashboard... 🚀" : "I need a link to save something!",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, something went wrong.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleProcessLog = () => {
    if (!chatLog.trim()) return;
    
    // Simple parser for common chat log formats: "[Time] Name: Message" or "Name: Message"
    const lines = chatLog.split('\n');
    lines.forEach((line, index) => {
      const match = line.match(/(?:\[?.*\]?\s)?([^:]+):\s*(.*)/);
      if (match) {
        const [_, name, message] = match;
        setTimeout(() => {
          handleSend(message);
        }, index * 500);
      } else if (line.trim()) {
        setTimeout(() => {
          handleSend(line.trim());
        }, index * 500);
      }
    });

    setChatLog('');
    setShowLogInput(false);
  };

  return (
    <div className="w-full max-w-sm bg-[#E5DDD5] dark:bg-[#0b141a] rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-gray-900 h-[650px] flex flex-col relative">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

      {/* Header */}
      <div className="bg-[#075E54] dark:bg-[#202c33] p-4 pt-8 flex items-center gap-3 text-white shadow-md z-10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
          SS
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Social Saver Bot</h3>
          <p className="text-[10px] opacity-80">online</p>
        </div>
        <div className="flex gap-4 opacity-80">
          <Video size={18} />
          <Phone size={18} />
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-none bg-repeat"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] p-2 rounded-lg shadow-sm relative text-sm
              ${msg.sender === 'me' 
                ? 'bg-[#DCF8C6] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-none' 
                : 'bg-white dark:bg-[#202c33] dark:text-[#e9edef] rounded-tl-none'}
            `}>
              {msg.isLink ? (
                <div className="flex flex-col gap-1">
                  <div className="bg-black/5 dark:bg-white/5 p-2 rounded border-l-4 border-[#075E54] dark:border-[#00a884] flex items-center gap-2">
                    <LinkIcon size={14} className="text-[#075E54] dark:text-[#00a884]" />
                    <span className="text-[10px] font-bold text-[#075E54] dark:text-[#00a884]">Link Shared</span>
                  </div>
                  <p className="text-blue-600 dark:text-[#53bdeb] underline break-all">{msg.text}</p>
                </div>
              ) : (
                <p className={msg.sender === 'me' ? 'text-gray-800 dark:text-[#e9edef]' : 'text-gray-800 dark:text-[#e9edef]'}>{msg.text}</p>
              )}
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[9px] text-gray-500 dark:text-[#8696a0]">{msg.timestamp}</span>
                {msg.sender === 'me' && <CheckCheck size={12} className="text-blue-500 dark:text-[#53bdeb]" />}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white dark:bg-[#202c33] p-2 rounded-lg rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#F0F0F0] dark:bg-[#202c33] flex items-center gap-2">
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
          <Smile size={20} className="text-gray-500 dark:text-[#8696a0]" />
          <input 
            type="text" 
            placeholder="Type a message"
            className="flex-1 bg-transparent outline-none text-sm dark:text-[#e9edef]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Paperclip size={20} className="text-gray-500 dark:text-[#8696a0] -rotate-45" />
          <button onClick={() => setShowLogInput(true)} title="Import Chat Log">
            <FileText size={20} className="text-gray-500 dark:text-[#8696a0]" />
          </button>
        </div>
        <button 
          onClick={() => handleSend()}
          className="w-10 h-10 bg-[#075E54] dark:bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
        >
          {input ? <Send size={18} /> : <Mic size={18} />}
        </button>
      </div>

      {/* Chat Log Modal */}
      <AnimatePresence>
        {showLogInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#2a3942] rounded-2xl p-4 w-full shadow-2xl"
            >
              <h4 className="font-bold text-gray-800 dark:text-[#e9edef] mb-2 flex items-center gap-2">
                <FileText size={18} className="text-[#075E54] dark:text-[#00a884]" />
                Import Chat Log
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-[#8696a0] mb-3">Paste your WhatsApp export or any chat log below. We'll simulate the conversation and save all links.</p>
              <textarea 
                className="w-full h-40 p-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#075E54] dark:focus:ring-[#00a884] dark:text-[#e9edef] resize-none"
                placeholder="[10:05] Alex: Check this out https://instagram.com/p/..."
                value={chatLog}
                onChange={(e) => setChatLog(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setShowLogInput(false)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-[#8696a0] hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProcessLog}
                  className="flex-1 py-2 bg-[#075E54] dark:bg-[#00a884] text-white text-sm font-medium rounded-lg shadow-md hover:bg-[#128C7E] dark:hover:bg-[#06cf9c] transition-colors"
                >
                  Process Log
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
