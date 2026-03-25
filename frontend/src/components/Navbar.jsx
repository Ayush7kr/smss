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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], complaints: [], visitors: [], bills: [] });
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
       document.removeEventListener('keydown', handleKeyDown);
       document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ users: [], complaints: [], visitors: [], bills: [] });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSearchOpen(true)}
          className="relative w-full max-w-sm hidden md:flex items-center bg-muted/50 hover:bg-muted border border-transparent hover:border-border/50 rounded-[12px] h-[38px] pl-3 pr-2 text-sm transition-all text-muted-foreground group"
        >
          <Search className="h-4 w-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="flex-1 text-left select-none">Search globally...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/50 shadow-sm ml-2">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
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

      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 px-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: -20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: -20 }}
               className="w-full max-w-2xl bg-card border border-border shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col"
            >
               <div className="border-b border-border flex items-center px-4 relative bg-card">
                  <Search className="h-5 w-5 text-muted-foreground absolute left-5" />
                  <input 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users, complaints, visitors, bills..."
                    className="w-full bg-transparent border-none py-5 pl-12 pr-4 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground text-lg"
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-[10px] font-bold tracking-wider bg-muted/80 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors uppercase border border-border/50 shadow-sm">ESC</button>
               </div>
               
               <div className="max-h-[60vh] overflow-y-auto p-2 bg-muted/10">
                 {isSearching ? (
                    <div className="p-12 text-center text-sm text-muted-foreground animate-pulse flex flex-col items-center">
                        <Search className="animate-spin mb-3 opacity-20" size={24} />
                        Searching universally...
                    </div>
                 ) : searchQuery.length < 2 ? (
                    <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                        <Search className="mb-3 opacity-20" size={32} />
                        Type at least 2 characters to search across records
                    </div>
                 ) : (searchResults.users.length === 0 && searchResults.complaints.length === 0 && searchResults.visitors.length === 0 && searchResults.bills.length === 0) ? (
                    <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                       <Search size={32} className="opacity-20 mb-3" />
                       No results found for "<span className="text-foreground">{searchQuery}</span>"
                    </div>
                 ) : (
                    <div className="space-y-6 p-3">
                       {searchResults.users.length > 0 && (
                          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 px-4 py-2 border-b border-border/50">Users</h4>
                             <div className="p-1">
                               {searchResults.users.map(u => (
                                  <div key={u._id} onClick={() => setSearchOpen(false)} className="p-3 hover:bg-primary/5 rounded-lg cursor-pointer flex justify-between items-center group transition-colors">
                                     <div>
                                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{u.name}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{u.email} • Flat {u.flatNumber || 'N/A'}</p>
                                     </div>
                                     <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{u.role}</span>
                                  </div>
                               ))}
                             </div>
                          </div>
                       )}
                       
                       {searchResults.complaints.length > 0 && (
                          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 px-4 py-2 border-b border-border/50">Complaints</h4>
                             <div className="p-1">
                               {searchResults.complaints.map(c => (
                                  <div key={c._id} onClick={() => setSearchOpen(false)} className="p-3 hover:bg-red-500/5 rounded-lg cursor-pointer transition-colors group">
                                     <div className="flex justify-between items-center">
                                         <p className="font-semibold text-sm group-hover:text-red-500 transition-colors">{c.category}</p>
                                         <span className="text-[10px] border border-border text-muted-foreground px-2 py-0.5 rounded-md shadow-sm">{c.status}</span>
                                     </div>
                                     <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{c.description}</p>
                                  </div>
                               ))}
                             </div>
                          </div>
                       )}

                       {searchResults.bills.length > 0 && (
                          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 px-4 py-2 border-b border-border/50">Bills & Dues</h4>
                             <div className="p-1">
                               {searchResults.bills.map(b => (
                                  <div key={b._id} onClick={() => setSearchOpen(false)} className="p-3 hover:bg-orange-500/5 rounded-lg cursor-pointer transition-colors group">
                                     <div className="flex justify-between items-center">
                                         <p className="font-semibold text-sm group-hover:text-orange-500 transition-colors">{b.description}</p>
                                         <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white shadow-sm ${b.status === 'Paid' ? 'bg-green-500' : 'bg-orange-500'}`}>{b.status}</span>
                                     </div>
                                     <p className="text-xs text-muted-foreground mt-1 mb-1 font-mono">${b.amount} <span className="text-[10px]">({b.month})</span></p>
                                  </div>
                               ))}
                             </div>
                          </div>
                       )}
                       
                    </div>
                 )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
