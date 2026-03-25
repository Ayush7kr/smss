import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { LogOut, Bell, Search, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Navbar = ({ toggleDarkMode, isDark }) => {
  const { logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(SocketContext);
  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
       document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Search removed as per request */}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative"
          >
             <Bell size={20} />
             {unreadCount > 0 && (
               <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background shadow-sm">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
             )}
          </button>
          
          {/* Dropdown */}
          {showNotifications && (
             <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 text-xs font-bold tracking-wider text-muted-foreground border-b border-border flex justify-between items-center bg-muted/30">
                   <span className="uppercase">Notifications</span>
                   {unreadCount > 0 && (
                     <button onClick={markAllAsRead} className="text-primary hover:underline hover:text-primary/80 transition-colors flex items-center gap-1">
                        <CheckCircle2 size={12} /> Mark all read
                     </button>
                   )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                   {(!notifications || notifications.length === 0) ? (
                      <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                         <Bell size={24} className="opacity-20 mb-2" />
                         No notifications yet.
                      </div>
                   ) : (
                      notifications.map(n => (
                         <div 
                           key={n._id} 
                           onClick={() => { if(!n.read) markAsRead(n._id); setShowNotifications(false); }}
                           className={`p-4 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                         >
                            <div className="flex gap-3">
                               <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-primary shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-transparent'}`} />
                               <div>
                                 <p className={`text-sm ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                                 <p className={`text-xs mt-1 leading-relaxed ${!n.read ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>{n.message}</p>
                                 <p className="text-[10px] text-muted-foreground mt-2 opacity-50 font-medium tracking-wide">
                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                                 </p>
                               </div>
                            </div>
                         </div>
                      ))
                   )}
                </div>
             </div>
          )}
        </div>
        
        <button 
          onClick={toggleDarkMode} 
          className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
        >
           {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
