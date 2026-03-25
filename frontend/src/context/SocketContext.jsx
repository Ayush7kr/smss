import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let newSocket;
    if (user) {
      api.get('/notifications').then(res => {
         setNotifications(res.data);
         setUnreadCount(res.data.filter(n => !n.read).length);
      }).catch(err => console.error(err));

      newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.custom((t) => (
           <div className={`bg-card border-l-4 border-l-primary border border-border text-foreground px-5 py-4 rounded-xl shadow-xl flex items-start gap-3 w-80 cursor-pointer hover:bg-muted/50 transition-colors ${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out'}`} onClick={() => toast.dismiss(t.id)}>
              <div className="flex-1">
                 <p className="font-bold text-sm tracking-tight">{notification.title}</p>
                 <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
              </div>
           </div>
        ), { duration: 5000 });
      });

      setSocket(newSocket);
    } else {
       setNotifications([]);
       setUnreadCount(0);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user]);

  const markAsRead = async (id) => {
     try {
       await api.put(`/notifications/${id}/read`);
       setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
       setUnreadCount(prev => Math.max(0, prev - 1));
     } catch(e) { console.error(e); }
  };

  const markAllAsRead = async () => {
     try {
       await api.put(`/notifications/read-all`);
       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
       setUnreadCount(0);
     } catch(e) { console.error(e); }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
