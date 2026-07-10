import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, CheckSquare, Calendar, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread', 'System', 'Task', 'Leave'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/employee/notifications/${id}/read`);
      // Update local state without full reload
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/employee/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  // Filtering
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.is_read;
    if (activeTab === 'System') return n.type === 'System';
    if (activeTab === 'Task') return n.type === 'Task';
    if (activeTab === 'Leave') return n.type === 'Leave';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Notifications...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6 max-w-3xl">
      
      {/* Header Info */}
      <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Notifications Center</h2>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'You are all caught up.'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs bg-[#1a233a] hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all"
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Unread', 'System', 'Task', 'Leave'].map((tab) => {
          const count = tab === 'All' ? notifications.length 
            : tab === 'Unread' ? unreadCount 
            : notifications.filter(n => n.type === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                activeTab === tab 
                  ? 'bg-[#1a233a] text-blue-400 border-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800/20'
              }`}
            >
              {tab}
              {count > 0 && <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* List items */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#12192b] border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-slate-500">
            <BellOff className="mb-4 text-slate-600" size={32} />
            <p className="text-sm font-semibold">No notifications found</p>
            <p className="text-xs text-slate-600 mt-1">Notifications matching the "{activeTab}" filter will appear here.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`bg-[#12192b] p-4 rounded-xl border border-slate-800 flex items-start gap-4 transition-all relative overflow-hidden ${
                !n.is_read ? 'border-l-4 border-l-blue-500 cursor-pointer hover:bg-slate-800/10' : 'opacity-70'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                n.type === 'Task' ? 'bg-emerald-500/10 text-emerald-400' :
                n.type === 'Leave' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {n.type === 'Task' ? <CheckSquare size={16} /> : n.type === 'Leave' ? <Calendar size={16} /> : <Bell size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-bold text-slate-200">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse absolute top-4 right-4"></span>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
