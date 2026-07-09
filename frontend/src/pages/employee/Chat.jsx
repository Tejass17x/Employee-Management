import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let interval;
    if (activeContact) {
      fetchMessages(activeContact.id);
      
      // Poll for new messages every 3 seconds
      interval = setInterval(() => {
        fetchMessages(activeContact.id, true);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/chat/contacts');
      setContacts(res.data);
      if (res.data.length > 0) {
        setActiveContact(res.data[0]);
      }
    } catch (e) {
      console.error('Error fetching chat contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId, isSilent = false) => {
    try {
      const res = await api.get(`/employee/chat/messages/${contactId}`);
      
      // If count of messages changed, update local state
      if (res.data.length !== messages.length) {
        setMessages(res.data);
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    const messageText = inputMessage;
    setInputMessage('');
    setSending(true);

    try {
      // Optimistic update
      const optimisticMsg = {
        id: Date.now(),
        sender_id: JSON.parse(localStorage.getItem('user'))?.id,
        receiver_id: activeContact.id,
        message: messageText,
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMsg]);

      await api.post('/employee/chat/messages', {
        receiver_id: activeContact.id,
        message: messageText
      });

      // Fetch official list
      fetchMessages(activeContact.id, true);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Conversations...
      </div>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="text-white font-sans pb-10 flex flex-col md:flex-row bg-[#12192b] border border-slate-800 rounded-2xl overflow-hidden h-[500px]">
      
      {/* Left Column: Contacts list */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col h-full bg-[#0d1322]">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-300">Direct Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => {
                setActiveContact(contact);
                setMessages([]);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                activeContact?.id === contact.id ? 'bg-[#1a233a]' : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
                {contact.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-sm font-bold text-slate-200 truncate">{contact.name}</span>
                </div>
                <span className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-bold">{contact.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Chat Thread */}
      <div className="flex-1 flex flex-col h-full bg-[#12192b]">
        {activeContact ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                  {activeContact.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{activeContact.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                    Online • {activeContact.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <p>Send a message to start conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${
                        isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed break-words">{msg.message}</p>
                        <span className={`block text-[9px] text-right mt-1.5 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0d1322] flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={`Message ${activeContact.name.split(' ')[0]}...`}
                className="flex-1 bg-[#0a0f1c] border border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
            <p>Select a contact to begin chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
