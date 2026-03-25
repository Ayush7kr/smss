import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { 
  Building2, Users, AlertCircle, CalendarClock, 
  Wallet, ShieldCheck, Wrench, LayoutDashboard, ChevronLeft, ChevronRight,
  Megaphone
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const roleLinks = {
  Super_Admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Societies', path: '/societies', icon: Building2 },
  ],
  Society_Admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Residents', path: '/residents', icon: Users },
    { name: 'Notice Board', path: '/notices', icon: Megaphone },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'Billing', path: '/billing', icon: Wallet },
    { name: 'Visitors', path: '/visitors', icon: ShieldCheck },
    { name: 'Vendors', path: '/vendors', icon: Wrench },
  ],
  Resident: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/notices', icon: Megaphone },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'My Bills', path: '/billing', icon: Wallet },
    { name: 'Visitors', path: '/visitors', icon: ShieldCheck },
  ],
  Security_Guard: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/notices', icon: Megaphone },
    { name: 'Visitors', path: '/visitors', icon: ShieldCheck },
  ],
  Vendor: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/notices', icon: Megaphone },
    { name: 'My Tasks', path: '/complaints', icon: Wrench },
  ]
};

const Sidebar = ({ isOpen, toggle }) => {
  const { user } = useContext(AuthContext);
  const links = user ? roleLinks[user.role] : [];

  return (
    <motion.div 
      animate={{ width: isOpen ? 256 : 80 }}
      className="h-screen bg-background border-r border-border flex flex-col justify-between sticky top-0 z-50 text-foreground transition-all duration-300"
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
              >
                SSMS
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={toggle} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => twMerge(clsx(
                "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              ))}
            >
              <link.icon size={22} className={isOpen ? "" : "mx-auto"} />
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {link.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
         <div className="flex items-center gap-3">
             <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 {user?.name?.charAt(0) || 'U'}
             </div>
             {isOpen && (
                 <div className="flex flex-col overflow-hidden">
                     <span className="text-sm font-medium truncate">{user?.name}</span>
                     <span className="text-xs text-muted-foreground truncate">{user?.role?.replace('_', ' ')}</span>
                 </div>
             )}
         </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
