import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  currentTab?: string;
  onSearchChange?: (val: string) => void;
  isScannerOnline?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  currentTab = "Dashboard", 
  onSearchChange,
  isScannerOnline = true
}) => {
  const { user } = useAuth();
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 select-none w-full sticky top-0 z-30">
      
      <div className="flex items-center gap-2 select-none">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">Workspace</span>
        <span className="text-border text-xs font-mono">/</span>
        <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider mr-2">
          {currentTab}
        </span>
        <span className="text-border text-xs font-mono">/</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-[#0C0C0E]/40 ml-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isScannerOnline ? "bg-success animate-pulse shadow-[0_0_6px_rgba(0,229,255,0.4)]" : "bg-red-500 animate-pulse"}`} />
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-text-secondary">
            {isScannerOnline ? "Scanner Online" : "Scanner Offline"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="relative w-60 group select-text hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted transition-colors duration-150 group-hover:text-primary" />
          <input
            type="text"
            placeholder="Search workspace..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-12 py-1.5 text-xs text-text-primary placeholder-text-muted focus:border-primary/40 focus:outline-none transition-all duration-150 font-medium"
          />
          
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[8px] font-mono text-text-muted pointer-events-none select-none font-bold">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>

        <button 
          onClick={() => alert("No new notifications inside your workspace backlog.")}
          className="relative w-8 h-8 rounded-xl bg-card border border-border hover:border-primary/20 flex items-center justify-center text-text-secondary hover:text-[#FAFAFA] transition-all duration-150 cursor-pointer shrink-0"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary border border-background" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <div className="relative w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-sans text-[10px] font-bold text-primary shrink-0 select-none">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-6 h-6 rounded-full object-cover" 
              />
            ) : (
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-success border border-background animate-pulse" />
          </div>
          <span className="text-xs font-bold text-text-primary hidden md:block select-none">{user?.name || 'Developer'}</span>
        </div>

      </div>

    </header>
  );
};

export default Topbar;
