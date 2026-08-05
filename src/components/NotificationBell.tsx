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

  // Cargar notificaciones al iniciar
  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getUserNotifications();
      setNotifications(data);
    };
    fetchNotifications();

    // Actualizar cada minuto
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

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
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await markNotificationAsRead(id);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100 flex items-center justify-center"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-zinc-500">{unreadCount} nuevas</span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className={`px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => handleNotificationClick(notif.id, notif.is_read)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-2 font-medium">
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
