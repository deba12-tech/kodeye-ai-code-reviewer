import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../ui/Logo';
import { 
  LayoutDashboard, Terminal, ShieldAlert, 
  History, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  onExit 
}) => {
  const { user, logout } = useAuth();

  const sidebarItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "New Review", icon: <Terminal className="w-4 h-4" /> },
    { label: "Bug Tracker", icon: <ShieldAlert className="w-4 h-4" /> },
    { label: "History", icon: <History className="w-4 h-4" /> },
    { label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-60 border-r border-border bg-background h-screen flex flex-col justify-between p-4 select-none flex-shrink-0 z-10 text-left">
      
      <div className="space-y-6">
        <div className="px-2.5 py-3 border-b border-border/40 flex items-center justify-between">
          <Logo showText={true} />
        </div>
        
        <nav className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => {
            const isActive = currentTab === item.label || (item.label === "New Review" && currentTab === "Review Report");
            return (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={`relative w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-3 transition-all duration-150 cursor-pointer text-left border ${
                  isActive 
                    ? 'text-[#FAFAFA] bg-card border-border' 
                    : 'text-text-secondary border-transparent hover:text-[#FAFAFA] hover:bg-card/40'
                }`}
              >
                {isActive && (
                  <motion.span 
                    layoutId="sidebarActiveLine"
                    className="absolute left-0 top-2.5 bottom-2.5 w-[2px] bg-primary rounded" 
                  />
                )}

                <div className={`transition-all duration-150 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {item.icon}
                </div>

                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-3 border-t border-border flex flex-col">
        <div className="flex items-center justify-between bg-card/30 border border-border/80 px-2.5 py-2 rounded-xl">
          <div className="flex items-center gap-2 truncate">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-7 h-7 rounded-full border border-primary/20 shrink-0 select-none object-cover" 
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-sans text-xs font-bold text-primary shrink-0 select-none">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="text-left truncate select-none">
              <div className="text-[11px] font-bold text-text-primary truncate">{user?.name || 'Developer'}</div>
              <div className="text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider">{user?.plan ? `${user.plan} Plan` : 'Free Tier'}</div>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              await logout();
              onExit();
            }}
            className="p-1.5 rounded-lg border border-border hover:border-red-500/20 text-text-secondary hover:text-red-400 bg-background hover:bg-red-500/5 transition-all duration-150 cursor-pointer shrink-0"
            title="Log Out & Exit"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
