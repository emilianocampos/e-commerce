'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead } from '@/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const data = await getUserNotifications();
    setNotifications(data);
  };

  // Cargar notificaciones al iniciar y al enfocar la ventana
  useEffect(() => {
    fetchNotifications();

    window.addEventListener('focus', fetchNotifications);
    return () => {
      window.removeEventListener('focus', fetchNotifications);
    };
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await markNotificationAsRead(id);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={handleToggleOpen}
        className="relative p-2 text-inherit hover:opacity-80 transition-opacity rounded-full flex items-center justify-center cursor-pointer"
        aria-label="Ver notificaciones"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 overflow-hidden text-zinc-900 dark:text-zinc-100">
          <div className="bg-zinc-50 dark:bg-zinc-800/80 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>
            )}
          </div>
          
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-400 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className={`px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}
                    onClick={() => handleNotificationClick(notif.id, notif.is_read)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${!notif.is_read ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-600 dark:text-zinc-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
