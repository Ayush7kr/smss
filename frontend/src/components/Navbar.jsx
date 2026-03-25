import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Bell, Search, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleDarkMode, isDark }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-muted border-none rounded-full h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
           <Bell size={20} />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-background"></span>
        </button>
        
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
