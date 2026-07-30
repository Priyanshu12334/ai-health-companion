import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      const formatted = [];
      res.data.forEach(msg => {
        formatted.push({ role: 'user', content: msg.message, id: `${msg._id}-u`, dbId: msg._id });
        formatted.push({ role: 'ai', content: msg.response, id: `${msg._id}-a`, dbId: msg._id });
      });
      setMessages(formatted);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  useEffect(() => {
    document.title = "AI Health Assistant";
    fetchHistory();
  }, []);

  const deleteMessage = async (dbId) => {
    if (!dbId) return;
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/ai/chat/${dbId}`);
      toast.success('Message deleted');
      fetchHistory();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Delete all AI conversations?")) return;
    try {
      await api.delete('/ai/chat/clear');
      toast.success('Conversation cleared');
      setMessages([]);
    } catch (error) {
      toast.error('Failed to clear conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: Date.now().toString() }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response, id: res.data._id }]);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg.content !== userMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-4.5rem)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-color shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-sky tracking-tight">AI Health Assistant</h2>
            <p className="text-xs text-text-secondary">Personalized wellness advice powered by Wellora</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearHistory} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border border-border-color"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center text-text-secondary h-full min-h-[300px] px-4 space-y-3"
          >
            <div className="w-16 h-16 rounded-3xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-text-sky">How can I help you today?</h3>
            <p className="text-sm max-w-sm text-text-secondary leading-relaxed">
              Ask me about your hydration, sleep quality, daily mood, or tips for improving your overall health score!
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex group gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative max-w-[90%] md:max-w-[75%] p-4 rounded-2xl text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap ${
                  isUser 
                    ? 'bg-sky-600 text-white rounded-br-xs shadow-md shadow-sky-600/10' 
                    : 'bg-card border border-border-color text-text-sky rounded-bl-xs shadow-sm'
                }`}>
                  {msg.content}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-surface border border-border-color text-text-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}

                {msg.dbId && (
                  <button 
                    onClick={() => deleteMessage(msg.dbId)} 
                    className="opacity-0 group-hover:opacity-100 self-center p-1.5 text-text-secondary hover:text-red-500 transition-all duration-200 shrink-0"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20 mt-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-card border border-border-color text-text-sky rounded-2xl rounded-bl-xs shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Sticky at Bottom) */}
      <div className="sticky bottom-0 bg-background pt-2 pb-2 shrink-0 border-t border-border-color/40">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to Wellora..."
            className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-card border border-border-color focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none shadow-sm transition-all text-text-sky text-sm md:text-base resize-none max-h-32 leading-relaxed"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-2.5 bottom-2.5 w-9 h-9 bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
