import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Loader2, Trash2, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AIChat = () => {
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [loading, setLoading] = useState(false);
 const messagesEndRef = useRef(null);

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
 messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, loading]);

 const sendMessage = async (e) => {
 e.preventDefault();
 if (!input.trim()) return;

 const userMsg = input.trim();
 setInput('');
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
 <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
 <div className="flex items-center gap-3 mb-6 bg-sky-100 dark:bg-sky-900/20 p-4 rounded-3xl border border-sky-200 dark:border-sky-800/30">
 <div className="p-2 bg-sky-600 text-white rounded-3xl">
 <Sparkles className="w-6 h-6" />
 </div>
 <div className="flex-1">
 <h2 className="text-xl font-bold text-sky-600 dark:text-sky-600">Aurora AI Companion</h2>
 <p className="text-sm text-black-100 dark:text-black-100">Personalized health advice based on your daily data.</p>
 </div>
 {messages.length > 0 && (
   <button onClick={clearHistory} className="flex flex-col items-center gap-1 text-xs text-text-secondary hover:text-red-500 transition-colors">
     <RotateCcw className="w-4 h-4" /> Clear
   </button>
 )}
 </div>

 <div className="flex-1 glass-card p-4 overflow-y-auto mb-4 flex flex-col gap-4">
 {messages.length === 0 && !loading && (
 <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary h-full my-10">
 <Sparkles className="w-12 h-12 text-sky-600 mb-4" />
 <p className="max-w-xs">Ask me about your health, hydration, sleep, or mood insights!</p>
 </div>
 )}
 
 {messages.map((msg) => (
 <div key={msg.id} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`flex gap-3 max-w-[85%] items-center ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
 msg.role === 'user' ? 'bg-surface text-text-secondary ' : 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
 }`}>
 {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
 </div>
 <div className={`p-4 rounded-2xl relative ${
 msg.role === 'user' 
 ? 'bg-surface text-text-sky rounded-tr-none' 
 : 'bg-sky-100 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/30 text-text-sky rounded-tl-none leading-relaxed'
 }`}>
 {msg.content}
 </div>
 {msg.dbId && (
   <button onClick={() => deleteMessage(msg.dbId)} className={`opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-red-500 transition-all ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`}>
     <Trash2 className="w-4 h-4" />
   </button>
 )}
 </div>
 </div>
 ))}
 {loading && (
 <div className="flex justify-start">
 <div className="flex gap-3">
 <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
 <Sparkles className="w-5 h-5" />
 </div>
 <div className="p-4 bg-sky-100 dark:bg-sky-600 border border-sky-200 dark:border-sky-800/30 rounded-2xl rounded-tl-none flex items-center gap-1">
 <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></span>
 <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
 <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
 </div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 <form onSubmit={sendMessage} className="relative mt-auto">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Ask Aurora something..."
 className="w-full pl-6 pr-14 py-4 rounded-full bg-card border border-border-color focus:border-sky-500 outline-none shadow-sm transition-all text-text-sky"
 disabled={loading}
 />
 <button 
 type="submit" 
 disabled={loading || !input.trim()}
 className="absolute right-2 top-2 bottom-2 w-10 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1" />}
 </button>
 </form>
 </div>
 );
};

export default AIChat;
