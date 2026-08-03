import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { typeConfig, formatTimeAgo } from '@/lib/notifications';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'info', label: 'Info' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Notification.list('-created_date', 100);
      setNotifications(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = base44.entities.Notification.subscribe(() => {
      fetchNotifications();
    });
    return unsubscribe;
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await base44.entities.Notification.update(id, { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;
      await base44.entities.Notification.bulkUpdate(unreadIds.map((id) => ({ id, read: true })));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await base44.entities.Notification.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: 'Deleted', description: 'Notification deleted' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) markAsRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated with system alerts and activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition whitespace-nowrap ${
              filter === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
            {opt.value === 'unread' && unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Bell className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'unread' ? "You've read everything!" : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const config = typeConfig[n.type] || typeConfig.info;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={`flex gap-4 px-5 py-4 hover:bg-slate-50 transition group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(n)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>}
                        <h3 className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(n.created_date)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {n.link && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNotificationClick(n); }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          View details →
                        </button>
                      )}
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="text-xs font-medium text-slate-400 hover:text-red-500 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
