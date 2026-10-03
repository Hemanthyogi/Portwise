import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Notification, PageResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?page=0&size=50');
      if (res.data.success) {
        setNotifications(res.data.data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational approvals, schedule updates, berth assignments, and logistics alerts
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-portblue-600 hover:text-portblue-700 bg-portblue-50 hover:bg-portblue-100 rounded-lg border border-portblue-200 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
          Mark All as Read
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No notifications in your inbox</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  !n.read ? 'bg-sky-50/40 hover:bg-sky-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      !n.read
                        ? 'bg-portblue-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-portblue-500 inline-block" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-2 block flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="shrink-0 p-1 text-slate-400 hover:text-portblue-600 rounded transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
